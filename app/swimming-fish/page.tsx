"use client";
import { useState, useEffect, useRef } from "react";

interface SurfacePoint {
  x: number;
  height: number;
  initHeight: number;
  fy: number;
  force: { previous: number; next: number };
  previous?: SurfacePoint;
  next?: SurfacePoint;
}

interface Fish {
  x: number;
  y: number;
  previousY: number;
  vx: number;
  vy: number;
  ay: number;
  direction: boolean;
  isOut: boolean;
  theta: number;
  phi: number;
}

const POINT_INTERVAL = 5;
const FISH_COUNT = 3;
const MAX_INTERVAL_COUNT = 50;
const INIT_HEIGHT_RATE = 0.5;
const THRESHOLD = 50;
const SPRING_CONSTANT = 0.03;
const SPRING_FRICTION = 0.9;
const WAVE_SPREAD = 0.3;
const ACCELERATION_RATE = 0.01;
const GRAVITY = 0.4;

export default function SwimmingFishPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(true);
  
  const rendererRef = useRef({
    width: 0,
    height: 0,
    points: [] as SurfacePoint[],
    fishes: [] as Fish[],
    intervalCount: MAX_INTERVAL_COUNT,
    reverse: false,
    pointInterval: 0,
    fishCount: 0,
    axis: null as { x: number; y: number } | null
  });

  const getRandomValue = (min: number, max: number): number => {
    return min + (max - min) * Math.random();
  };

  const createSurfacePoints = () => {
    const renderer = rendererRef.current;
    const count = Math.round(renderer.width / POINT_INTERVAL);
    renderer.pointInterval = renderer.width / (count - 1);
    renderer.points = [];

    const firstPoint: SurfacePoint = {
      x: 0,
      height: renderer.height * INIT_HEIGHT_RATE,
      initHeight: renderer.height * INIT_HEIGHT_RATE,
      fy: 0,
      force: { previous: 0, next: 0 }
    };
    renderer.points.push(firstPoint);

    for (let i = 1; i < count; i++) {
      const point: SurfacePoint = {
        x: i * renderer.pointInterval,
        height: renderer.height * INIT_HEIGHT_RATE,
        initHeight: renderer.height * INIT_HEIGHT_RATE,
        fy: 0,
        force: { previous: 0, next: 0 }
      };
      
      const previous = renderer.points[i - 1];
      point.previous = previous;
      previous.next = point;
      renderer.points.push(point);
    }
  };

  const createFish = (): Fish => {
    const renderer = rendererRef.current;
    const direction = Math.random() < 0.5;
    
    const fish: Fish = {
      direction,
      x: direction ? renderer.width + THRESHOLD : -THRESHOLD,
      y: 0,
      previousY: 0,
      vx: getRandomValue(4, 10) * (direction ? -1 : 1),
      vy: 0,
      ay: 0,
      isOut: false,
      theta: 0,
      phi: 0
    };

    if (renderer.reverse) {
      fish.y = getRandomValue(renderer.height * 0.1, renderer.height * 0.4);
      fish.vy = getRandomValue(2, 5);
      fish.ay = getRandomValue(0.05, 0.2);
    } else {
      fish.y = getRandomValue(renderer.height * 0.6, renderer.height * 0.9);
      fish.vy = getRandomValue(-5, -2);
      fish.ay = getRandomValue(-0.2, -0.05);
    }

    fish.previousY = fish.y;
    return fish;
  };

  const generateEpicenter = (x: number, y: number, velocity: number) => {
    const renderer = rendererRef.current;
    if (y < renderer.height / 2 - THRESHOLD || y > renderer.height / 2 + THRESHOLD) {
      return;
    }
    
    const index = Math.round(x / renderer.pointInterval);
    if (index < 0 || index >= renderer.points.length) {
      return;
    }
    
    const point = renderer.points[index];
    point.fy = renderer.height * ACCELERATION_RATE * 
      ((renderer.height - point.height - y) >= 0 ? -1 : 1) * Math.abs(velocity);
  };

  const updateSurfacePoints = () => {
    const renderer = rendererRef.current;
    
    for (const point of renderer.points) {
      point.fy += SPRING_CONSTANT * (point.initHeight - point.height);
      point.fy *= SPRING_FRICTION;
      point.height += point.fy;
    }

    for (const point of renderer.points) {
      if (point.previous) {
        point.force.previous = WAVE_SPREAD * (point.height - point.previous.height);
      }
      if (point.next) {
        point.force.next = WAVE_SPREAD * (point.height - point.next.height);
      }
    }

    for (const point of renderer.points) {
      if (point.previous) {
        point.previous.height += point.force.previous;
        point.previous.fy += point.force.previous;
      }
      if (point.next) {
        point.next.height += point.force.next;
        point.next.fy += point.force.next;
      }
    }
  };

  const updateFish = (fish: Fish) => {
    const renderer = rendererRef.current;
    fish.previousY = fish.y;
    fish.x += fish.vx;
    fish.y += fish.vy;
    fish.vy += fish.ay;

    if (renderer.reverse) {
      if (fish.y > renderer.height * INIT_HEIGHT_RATE) {
        fish.vy -= GRAVITY;
        fish.isOut = true;
      } else {
        if (fish.isOut) {
          fish.ay = getRandomValue(0.05, 0.2);
        }
        fish.isOut = false;
      }
    } else {
      if (fish.y < renderer.height * INIT_HEIGHT_RATE) {
        fish.vy += GRAVITY;
        fish.isOut = true;
      } else {
        if (fish.isOut) {
          fish.ay = getRandomValue(-0.2, -0.05);
        }
        fish.isOut = false;
      }
    }

    if (!fish.isOut) {
      fish.theta += Math.PI / 20;
      fish.theta %= Math.PI * 2;
      fish.phi += Math.PI / 30;
      fish.phi %= Math.PI * 2;
    }

    generateEpicenter(
      fish.x + (fish.direction ? -1 : 1) * THRESHOLD,
      fish.y,
      fish.y - fish.previousY
    );

    if ((fish.vx > 0 && fish.x > renderer.width + THRESHOLD) ||
        (fish.vx < 0 && fish.x < -THRESHOLD)) {
      const newFish = createFish();
      Object.assign(fish, newFish);
    }
  };

  const drawFish = (ctx: CanvasRenderingContext2D, fish: Fish) => {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(Math.PI + Math.atan2(fish.vy, fish.vx));
    ctx.scale(1, fish.direction ? 1 : -1);
    
    ctx.fillStyle = 'rgba(100, 150, 200, 0.8)';
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.bezierCurveTo(-20, 15, 15, 10, 40, 0);
    ctx.bezierCurveTo(15, -10, -20, -15, -30, 0);
    ctx.fill();

    ctx.save();
    ctx.translate(40, 0);
    ctx.scale(0.9 + 0.2 * Math.sin(fish.theta), 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(5, 10, 20, 8);
    ctx.quadraticCurveTo(12, 5, 10, 0);
    ctx.quadraticCurveTo(12, -5, 20, -8);
    ctx.quadraticCurveTo(5, -10, 0, 0);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-3, 0);
    ctx.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(fish.phi)) * 
      (rendererRef.current.reverse ? -1 : 1));
    
    ctx.beginPath();
    if (rendererRef.current.reverse) {
      ctx.moveTo(5, 0);
      ctx.bezierCurveTo(10, 10, 10, 30, 0, 40);
      ctx.bezierCurveTo(-12, 25, -8, 10, 0, 0);
    } else {
      ctx.moveTo(-5, 0);
      ctx.bezierCurveTo(-10, -10, -10, -30, 0, -40);
      ctx.bezierCurveTo(12, -25, 8, -10, 0, 0);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  const setup = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = rendererRef.current;
    renderer.width = container.offsetWidth;
    renderer.height = container.offsetHeight;
    renderer.fishCount = FISH_COUNT * renderer.width / 500 * renderer.height / 500;
    
    canvas.width = renderer.width;
    canvas.height = renderer.height;
    
    renderer.points = [];
    renderer.fishes = [];
    renderer.intervalCount = MAX_INTERVAL_COUNT;
    
    renderer.fishes.push(createFish());
    createSurfacePoints();
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const axis = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const renderer = rendererRef.current;
    if (!renderer.axis) {
      renderer.axis = axis;
    }
    
    generateEpicenter(axis.x, axis.y, axis.y - renderer.axis.y);
    renderer.axis = axis;
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    rendererRef.current.axis = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleClick = () => {
    const renderer = rendererRef.current;
    renderer.reverse = !renderer.reverse;
    
    for (const fish of renderer.fishes) {
      fish.isOut = !fish.isOut;
      fish.ay *= -1;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setup();

    const handleResize = () => {
      setup();
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      if (!isRunning) return;

      const renderer = rendererRef.current;
      
      updateSurfacePoints();

      if (renderer.fishes.length < renderer.fishCount) {
        if (--renderer.intervalCount === 0) {
          renderer.intervalCount = MAX_INTERVAL_COUNT;
          renderer.fishes.push(createFish());
        }
      }

      for (const fish of renderer.fishes) {
        updateFish(fish);
      }

      ctx.clearRect(0, 0, renderer.width, renderer.height);
      
      for (const fish of renderer.fishes) {
        drawFish(ctx, fish);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'xor';
      ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, renderer.reverse ? 0 : renderer.height);
      
      for (const point of renderer.points) {
        ctx.lineTo(point.x, renderer.height - point.height);
      }
      
      ctx.lineTo(renderer.width, renderer.reverse ? 0 : renderer.height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setup();
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-100 to-blue-300 relative overflow-hidden pt-16">
      <div className="absolute top-20 left-4 z-10 bg-white/20 backdrop-blur-sm rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-bold text-blue-800 mb-4">Swimming Fish Effect</h2>
        
        <button
          onClick={toggleAnimation}
          className={`px-4 py-2 rounded-lg font-medium transition-all w-full ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        
        <button
          onClick={resetAnimation}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
        >
          Reset
        </button>
        
        <div className="text-blue-800 text-xs space-y-1">
          <p>Fish Count: {rendererRef.current.fishes.length}</p>
          <p>Direction: {rendererRef.current.reverse ? "Up" : "Down"}</p>
          <p>Click water to reverse direction</p>
          <p>Move mouse over water for ripples</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="fixed bottom-0 left-0 w-full h-48 opacity-90 z-10"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      <div className="flex items-center justify-center h-full">
        <div className="text-center text-blue-800 max-w-2xl px-8">
          <h1 className="text-4xl font-bold mb-6">Swimming Fish Animation</h1>
          <p className="text-lg mb-4">
            Watch the fish swim at the bottom of the screen with realistic water physics.
          </p>
          <p className="text-base opacity-80">
            Move your mouse over the water area to create ripples, or click to reverse the swimming direction.
          </p>
        </div>
      </div>
    </div>
  );
}