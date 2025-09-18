"use client";
import { useState, useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

const NUM_POINTS = 13000;

const DOT_SIZE = 1;
const PET_COLOR = "rgb(250, 240, 240)";
const PET_SPEED = 0.3;
const ROTATION_SPEED = 1.4;
const WANDER_STRENGTH = 0.0005;
const WALL_REPULSION_STRENGTH = 1;

export default function DesktopPetPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const petStateRef = useRef({
    x: 0,
    y: 0,
    angle: 0,
    orientationAngle: 0,
    t: 0,
    tStep: Math.PI / 240,
    points: [] as Point[]
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      petStateRef.current.x = canvas.width / 2;
      petStateRef.current.y = canvas.height / 2;
      petStateRef.current.angle = Math.random() * 2 * Math.PI;
      petStateRef.current.orientationAngle = petStateRef.current.angle;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const initializePoints = () => {
      const points: Point[] = [];
      for (let i = NUM_POINTS; i > 0; i--) {
        points.push({ x: i, y: i / 235.0 });
      }
      petStateRef.current.points = points;
    };

    initializePoints();

    const checkBounds = (state: typeof petStateRef.current) => {
      const buffer = 200;
      let dx = Math.cos(state.angle);
      let dy = Math.sin(state.angle);
      let repulsed = false;

      if (state.x < buffer) {
        dx += WALL_REPULSION_STRENGTH;
        repulsed = true;
      }
      if (state.x > canvas.width - buffer) {
        dx -= WALL_REPULSION_STRENGTH;
        repulsed = true;
      }
      if (state.y < buffer) {
        dy += WALL_REPULSION_STRENGTH;
        repulsed = true;
      }
      if (state.y > canvas.height - buffer) {
        dy -= WALL_REPULSION_STRENGTH;
        repulsed = true;
      }

      if (repulsed) {
        state.angle = Math.atan2(dy, dx);
      }

      state.x = Math.max(buffer, Math.min(canvas.width - buffer, state.x));
      state.y = Math.max(buffer, Math.min(canvas.height - buffer, state.y));
    };

    const updateState = () => {
      const state = petStateRef.current;
      
      state.angle += (Math.random() - 0.5) * 2 * WANDER_STRENGTH;
      state.x += PET_SPEED * Math.cos(state.orientationAngle);
      state.y += PET_SPEED * Math.sin(state.orientationAngle);
      
      checkBounds(state);
      
      let angleDiff = state.angle - state.orientationAngle;
      angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
      state.orientationAngle += angleDiff * ROTATION_SPEED;
      
      state.t += state.tStep;
    };

    const draw = () => {
      const state = petStateRef.current;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const points = state.points;
      const t = state.t;
      
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = points[i].x;
        const y = points[i].y;
        
        const k = (4 + Math.sin(y * 2 - t) * 3) * Math.cos(x / 29);
        const e = y / 8 - 13;
        const d = Math.sqrt(k * k + e * e);
        const q = 3 * Math.sin(k * 2) + 0.3 / (k + Number.EPSILON) + 
                  Math.sin(y / 25) * k * (9 + 4 * Math.sin(e * 9 - d * 3 + t * 2));
        const c = d - t;
        
        const localU = q + 30 * Math.cos(c) + 200;
        const localV = q * Math.sin(c) + 39 * d - 220;
        
        const centeredU = localU - 200;
        const centeredV = -localV + 220;
        
        const angleCorrection = -Math.PI / 2;
        const cosO = Math.cos(state.orientationAngle + angleCorrection);
        const sinO = Math.sin(state.orientationAngle + angleCorrection);
        
        const rotatedU = centeredU * cosO - centeredV * sinO;
        const rotatedV = centeredU * sinO + centeredV * cosO;
        
        const screenU = rotatedU + state.x;
        const screenV = rotatedV + state.y;
        
        ctx.fillStyle = PET_COLOR;
        ctx.beginPath();
        ctx.arc(screenU, screenV, DOT_SIZE, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    const animate = () => {
      if (!isRunning) return;
      
      updateState();
      draw();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const togglePet = () => {
    setIsRunning(!isRunning);
  };

  const resetPet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    petStateRef.current.x = canvas.width / 2;
    petStateRef.current.y = canvas.height / 2;
    petStateRef.current.angle = Math.random() * 2 * Math.PI;
    petStateRef.current.orientationAngle = petStateRef.current.angle;
    petStateRef.current.t = 0;
  };

  return (
    <main className="h-full bg-black overflow-hidden pt-16">
      <div className="relative w-full h-[calc(100%-4rem)] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: "transparent" }}
        />
        
        <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
          <button
            onClick={togglePet}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isRunning
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isRunning ? "Stop Pet" : "Start Pet"}
          </button>
          
          <button
            onClick={resetPet}
            className="block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
          >
            Reset Position
          </button>
          
          <div className="text-white text-xs space-y-1">
            <p>Desktop Pet Simulation</p>
            <p>Points: {NUM_POINTS.toLocaleString()}</p>
            <p>Status: {isRunning ? "Running" : "Stopped"}</p>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 text-white/60 text-xs">
          Press ESC to return to main page
        </div>
      </div>
    </main>
  );
}