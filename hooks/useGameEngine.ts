import { useState, useEffect, useRef } from "react";

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number; // Track number of jumps
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  scored?: boolean;
}

interface Circle {
  x: number;
  y: number;
  radius: number;
  passed: boolean;
}

export default function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Audio context for generating sounds
  const audioContextRef = useRef<AudioContext | null>(null);
  // Flag to track if background music should be playing
  const isBackgroundMusicPlayingRef = useRef(false);
  // Interval ID for background music
  const backgroundMusicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  };

  // Clean up background music interval
  const stopBackgroundMusic = () => {
    if (backgroundMusicIntervalRef.current) {
      clearInterval(backgroundMusicIntervalRef.current);
      backgroundMusicIntervalRef.current = null;
      isBackgroundMusicPlayingRef.current = false;
    }
  };

  // Start background music loop
  const startBackgroundMusic = () => {
    // Stop any existing background music
    stopBackgroundMusic();

    // Only start if not muted and audio context exists
    if (!isMuted && audioContextRef.current) {
      isBackgroundMusicPlayingRef.current = true;

      // Play background music every 2 seconds
      backgroundMusicIntervalRef.current = setInterval(() => {
        // Double-check mute state before playing
        if (!isMuted && audioContextRef.current) {
          playBackgroundMusic();
        }
      }, 2000);
    }
  };

  const playerRef = useRef<Player>({
    x: 50,
    y: 300,
    width: 20,
    height: 20,
    velocityY: 0,
    isJumping: false,
    jumpCount: 0, // Initialize jump count
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const circlesRef = useRef<Circle[]>([]);
  const gameRunningRef = useRef(true);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const obstacleSpawnTimerRef = useRef<number>(0);
  const circleSpawnTimerRef = useRef<number>(0);
  const canvasWidthRef = useRef(800);
  const canvasHeightRef = useRef(400);
  const groundYRef = useRef(320);

  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const MAX_JUMPS = 2; // Maximum number of jumps
  const OBSTACLE_SPEED = 3;
  const OBSTACLE_SPAWN_INTERVAL = 1500; // milliseconds
  const CIRCLE_SPAWN_INTERVAL = 4000; // milliseconds

  const resetGame = () => {
    // Cancel any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Stop any background music
    stopBackgroundMusic();

    // Reset all refs to initial values (same as when hook is first created)
    playerRef.current = {
      x: 50,
      y: 300,
      width: 20,
      height: 20,
      velocityY: 0,
      isJumping: false,
      jumpCount: 0,
    };

    obstaclesRef.current = [];
    circlesRef.current = [];
    gameRunningRef.current = true;
    lastTimeRef.current = 0;
    obstacleSpawnTimerRef.current = 0;
    circleSpawnTimerRef.current = 0;
    canvasWidthRef.current = 800;
    canvasHeightRef.current = 400;
    groundYRef.current = 320;

    // Reset all state variables to initial values
    setScore(0);
    setGameOver(false);
    setGameRunning(true);
    // Note: isMuted state is preserved across game resets

    // Initialize audio context if needed
    initAudioContext();

    // Start background music if not muted
    if (!isMuted) {
      startBackgroundMusic();
    }

    // Start a fresh animation frame
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const togglePause = () => {
    if (gameOver) return;

    const newRunningState = !gameRunning;
    setGameRunning(newRunningState);

    if (newRunningState) {
      // Resume game
      lastTimeRef.current = 0;
      // Always start a new animation frame when resuming
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(gameLoop);

      // Restart background music if not muted
      if (!isMuted) {
        startBackgroundMusic();
      }
    } else {
      // Pause game - cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }

      // Stop background music when pausing
      stopBackgroundMusic();
    }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    // Handle background music based on new mute state
    if (newMuteState) {
      // If muting, stop background music
      stopBackgroundMusic();
    } else {
      // If unmuting and game is running, restart background music
      if (gameRunning && !gameOver) {
        startBackgroundMusic();
      }
    }
  };

  // Play a beep sound
  const playBeep = (frequency: number, duration: number) => {
    if (isMuted || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContextRef.current.currentTime + duration / 1000
      );

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Beep sound failed:", error);
    }
  };

  // Play jump sound
  const playJumpSound = () => {
    playBeep(523.25, 100); // C5 note for 100ms
  };

  // Play game over sound
  const playGameOverSound = () => {
    if (isMuted || !audioContextRef.current) return;

    try {
      // Store the audio context reference to ensure it doesn't change during timeouts
      const audioContext = audioContextRef.current;
      // Store the mute state at the time of function call
      const wasMuted = isMuted;

      // Play a sequence of notes for game over
      const notes = [350, 300, 250, 200];
      notes.forEach((freq, index) => {
        setTimeout(() => {
          // Check if still muted, audio context still exists, and wasn't muted when function started
          if (!isMuted && !wasMuted && audioContextRef.current) {
            playBeep(freq, 200);
          }
        }, index * 300); // Increased delay to 300ms for better spacing
      });
    } catch (error) {
      console.warn("Game over sound failed:", error);
    }
  };

  // Play background music (simple repeating pattern)
  const playBackgroundMusic = () => {
    if (isMuted || !audioContextRef.current) return;

    // This would be a more complex implementation for background music
    // For now, we'll just play a simple repeating tone
    playBeep(220, 500); // A3 note
  };

  const jump = () => {
    if (!gameRunningRef.current || !gameRunning) return;

    // Check if player can jump (hasn't exceeded max jumps)
    if (playerRef.current.jumpCount < MAX_JUMPS) {
      playerRef.current.velocityY = JUMP_FORCE;
      playerRef.current.isJumping = true;
      playerRef.current.jumpCount += 1;

      // Play jump sound
      playJumpSound();
    }
  };

  const checkCollision = (player: Player, obstacle: Obstacle): boolean => {
    return (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    );
  };

  const checkCircleCollision = (player: Player, circle: Circle): boolean => {
    // Check if player is inside the circle
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const circleCenterX = circle.x;
    const circleCenterY = circle.y;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - circleCenterX, 2) +
        Math.pow(playerCenterY - circleCenterY, 2)
    );

    return distance < circle.radius;
  };

  const updatePlayer = (deltaTime: number) => {
    const player = playerRef.current;

    // Apply gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Ground collision
    if (player.y >= groundYRef.current - player.height) {
      player.y = groundYRef.current - player.height;
      player.velocityY = 0;
      player.isJumping = false;
      player.jumpCount = 0; // Reset jump count when landing
    }
  };

  const updateObstacles = (deltaTime: number) => {
    // Spawn new obstacles
    obstacleSpawnTimerRef.current += deltaTime;
    if (obstacleSpawnTimerRef.current >= OBSTACLE_SPAWN_INTERVAL) {
      const obstacleTypes = [
        { width: 20, height: 70 }, // Ground obstacle
        { width: 20, height: 50 }, // Flying obstacle
      ];

      const type =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const y =
        type.height === 70
          ? groundYRef.current - type.height
          : groundYRef.current - 150; // Ground or flying position

      obstaclesRef.current.push({
        x: canvasWidthRef.current,
        y: y,
        width: type.width,
        height: type.height,
      });

      obstacleSpawnTimerRef.current = 0;
    }

    // Move obstacles and check for collisions
    obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
      obstacle.x -= OBSTACLE_SPEED;

      // Check collision with player
      if (checkCollision(playerRef.current, obstacle)) {
        gameRunningRef.current = false;
        setGameRunning(false);
        setGameOver(true);
        // Cancel animation frame when game is over
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = 0;
        }

        // Stop background music
        stopBackgroundMusic();

        // Play game over sound
        playGameOverSound();

        return false;
      }

      // Increase score when passing an obstacle
      if (
        obstacle.x + obstacle.width < playerRef.current.x &&
        !obstacle.scored
      ) {
        setScore((prev) => prev + 1);
        obstacle.scored = true;
      }

      // Remove obstacles that are off screen
      return obstacle.x + obstacle.width > 0;
    });
  };

  const updateCircles = (deltaTime: number) => {
    // Spawn new circles
    circleSpawnTimerRef.current += deltaTime;
    if (circleSpawnTimerRef.current >= CIRCLE_SPAWN_INTERVAL) {
      // Randomly decide whether to spawn a circle (30% chance)
      if (Math.random() < 0.3) {
        // Calculate circle position to ensure it's reachable by player's double jump
        // Player starts at groundYRef.current - player.height
        // After double jump, player can reach approximately groundYRef.current - 150 to groundYRef.current - 100
        const minY = groundYRef.current - 150; // Minimum height (higher up)
        const maxY = groundYRef.current - 100; // Maximum height (lower down)
        const circleY = Math.random() * (maxY - minY) + minY;

        circlesRef.current.push({
          x: canvasWidthRef.current,
          y: circleY, // Position within reachable range
          radius: 30, // Large circle
          passed: false,
        });
      }

      circleSpawnTimerRef.current = 0;
    }

    // Move circles and check for passing
    circlesRef.current = circlesRef.current.filter((circle) => {
      circle.x -= OBSTACLE_SPEED;

      // Check if player passed through the circle
      if (!circle.passed && checkCircleCollision(playerRef.current, circle)) {
        setScore((prev) => prev + 2); // Bonus points for passing through circle
        circle.passed = true;
      }

      // Remove circles that are off screen
      return circle.x + circle.radius > 0;
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update canvas dimensions
    canvasWidthRef.current = ctx.canvas.width;
    canvasHeightRef.current = ctx.canvas.height;

    // Calculate ground position based on canvas height, ensuring it's visible on all devices
    // Use a minimum height for the ground area to ensure it's always visible
    const minHeight = 100; // Minimum height for ground area
    const groundHeight = Math.max(minHeight, ctx.canvas.height * 0.2); // 20% of canvas height or minimum height
    groundYRef.current = ctx.canvas.height - groundHeight;

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, "#4A00E0");
    gradient.addColorStop(1, "#8E2DE2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, groundYRef.current, ctx.canvas.width, groundHeight);

    // Draw circles
    circlesRef.current.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw inner circle for visual effect
      if (!circle.passed) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius - 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw player
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(
      playerRef.current.x,
      playerRef.current.y,
      playerRef.current.width,
      playerRef.current.height
    );

    // Draw obstacles
    ctx.fillStyle = "#FF4500";
    obstaclesRef.current.forEach((obstacle) => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw pause overlay if game is paused
    if (!gameRunning && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  };

  const gameLoop = (timestamp: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate delta time for smooth animation
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Only update game state if game is running (not paused and not over)
    if (gameRunning && !gameOver) {
      updatePlayer(deltaTime);
      updateObstacles(deltaTime);
      updateCircles(deltaTime);
    }

    draw(ctx);

    // Continue the animation loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  // Start background music when game starts
  const startGame = () => {
    if (!isMuted) {
      startBackgroundMusic();
    }
  };

  // Stop background music when game ends
  const endGame = () => {
    stopBackgroundMusic();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Set up event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        jump();
      } else if (e.code === "KeyP") {
        togglePause();
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };

    const handleClick = () => {
      initAudioContext();
      jump();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      initAudioContext();
      jump();
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clean up background music
      stopBackgroundMusic();

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    score,
    gameOver,
    resetGame,
    gameRunning,
    togglePause,
    isMuted,
    toggleMute,
  };
}
