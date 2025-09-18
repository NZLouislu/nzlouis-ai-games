"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Tree {
  x: number;
  h: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  color: string;
}

interface BackgroundTree {
  x: number;
  color: string;
}

interface Point {
  x: number;
  y: number;
}

const mainAreaWidth = 400;
const mainAreaHeight = 375;

const hill1BaseHeight = 80;
const hill1Speed = 0.2;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 50;
const hill2Speed = 0.2;
const hill2Amplitude = 15;
const hill2Stretch = 0.5;
const hill3BaseHeight = 15;
const hill3Speed = 1;
const hill3Amplitude = 10;
const hill3Stretch = 0.2;

export default function AirBalloonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const gameStateRef = useRef({
    balloonX: 0,
    balloonY: 0,
    verticalVelocity: 5,
    horizontalVelocity: 5,
    fuel: 100,
    heating: false,
    trees: [] as Tree[],
    backgroundTrees: [] as BackgroundTree[],
    horizontalPadding: 0,
    verticalPadding: 0,
  });

  const sinus = (degree: number): number => {
    return Math.sin((degree / 180) * Math.PI);
  };

  const generateTree = useCallback((): Tree => {
    const state = gameStateRef.current;
    const minimumGap = 50;
    const maximumGap = 600;

    const x = state.trees.length
      ? state.trees[state.trees.length - 1].x +
        minimumGap +
        Math.floor(Math.random() * (maximumGap - minimumGap))
      : 400;

    const h = 60 + Math.random() * 80;
    const r1 = 32 + Math.random() * 16;
    const r2 = 32 + Math.random() * 16;
    const r3 = 32 + Math.random() * 16;
    const r4 = 32 + Math.random() * 16;
    const r5 = 32 + Math.random() * 16;
    const r6 = 32 + Math.random() * 16;
    const r7 = 32 + Math.random() * 16;

    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];

    return { x, h, r1, r2, r3, r4, r5, r6, r7, color };
  }, []);

  const generateBackgroundTree = useCallback((): BackgroundTree => {
    const state = gameStateRef.current;
    const minimumGap = 30;
    const maximumGap = 150;

    const lastTree = state.backgroundTrees[state.backgroundTrees.length - 1];
    const furthestX = lastTree ? lastTree.x : 0;

    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];

    return { x, color };
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = gameStateRef.current;
    state.balloonX = 0;
    state.balloonY = 0;
    state.verticalVelocity = 5;
    state.horizontalVelocity = 5;
    state.fuel = 100;
    state.heating = false;
    state.horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
    state.verticalPadding = (window.innerHeight - mainAreaHeight) / 2;

    state.trees = [];
    for (let i = 1; i < window.innerWidth / 50; i++) {
      state.trees.push(generateTree());
    }

    state.backgroundTrees = [];
    for (let i = 1; i < window.innerWidth / 30; i++) {
      state.backgroundTrees.push(generateBackgroundTree());
    }

    setGameStarted(false);
    setShowRestart(false);
    setShowIntro(true);
  }, [generateTree, generateBackgroundTree]);

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawTrees = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    state.trees.forEach(({ x, h, r1, r2, r3, r4, r5, r6, r7, color }) => {
      ctx.save();
      ctx.translate(x, 0);

      const trunkWidth = 40;
      ctx.fillStyle = "#885F37";
      ctx.beginPath();
      ctx.moveTo(-trunkWidth / 2, 0);
      ctx.quadraticCurveTo(-trunkWidth / 4, -h / 2, -trunkWidth / 2, -h);
      ctx.lineTo(trunkWidth / 2, -h);
      ctx.quadraticCurveTo(trunkWidth / 4, -h / 2, trunkWidth / 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color;
      drawCircle(ctx, -20, -h - 15, r1);
      drawCircle(ctx, -30, -h - 25, r2);
      drawCircle(ctx, -20, -h - 35, r3);
      drawCircle(ctx, 0, -h - 45, r4);
      drawCircle(ctx, 20, -h - 35, r5);
      drawCircle(ctx, 30, -h - 25, r6);
      drawCircle(ctx, 20, -h - 15, r7);

      ctx.restore();
    });
  };

  const drawBalloon = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    ctx.save();
    ctx.translate(state.balloonX, state.balloonY);

    ctx.fillStyle = "#DB504A";
    ctx.fillRect(-30, -40, 60, 10);
    ctx.fillStyle = "#EA9E8D";
    ctx.fillRect(-30, -30, 60, 30);

    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, -40);
    ctx.lineTo(-24, -60);
    ctx.moveTo(24, -40);
    ctx.lineTo(24, -60);
    ctx.stroke();

    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.moveTo(-30, -60);
    ctx.quadraticCurveTo(-80, -120, -80, -160);
    ctx.arc(0, -160, 80, Math.PI, 0, false);
    ctx.quadraticCurveTo(80, -120, 30, -60);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawHeader = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;

    ctx.strokeStyle = state.fuel <= 30 ? "red" : "white";
    ctx.strokeRect(30, 30, 150, 30);
    ctx.fillStyle =
      state.fuel <= 30 ? "rgba(255,0,0,0.5)" : "rgba(150,150,200,0.5)";
    ctx.fillRect(30, 30, (150 * state.fuel) / 100, 30);

    const score = Math.floor(state.balloonX / 30);
    ctx.fillStyle = "black";
    ctx.font = "bold 32px Tahoma";
    ctx.textAlign = "end";
    ctx.textBaseline = "top";
    ctx.fillText(`${score} m`, window.innerWidth - 30, 30);
  };

  const drawSky = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, "#AADBEA");
    gradient.addColorStop(1, "#FEF1E1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  };

  const getHillY = (
    x: number,
    baseHeight: number,
    speedMultiplier: number,
    amplitude: number,
    stretch: number
  ): number => {
    const state = gameStateRef.current;
    const sineBaseY = -baseHeight;
    return (
      sinus((state.balloonX * speedMultiplier + x) * stretch) * amplitude +
      sineBaseY
    );
  };

  const getTreeY = (
    x: number,
    baseHeight: number,
    amplitude: number
  ): number => {
    const sineBaseY = -baseHeight;
    return sinus(x) * amplitude + sineBaseY;
  };

  const drawHill = (
    ctx: CanvasRenderingContext2D,
    baseHeight: number,
    speedMultiplier: number,
    amplitude: number,
    stretch: number,
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, speedMultiplier, amplitude, stretch));
    for (let i = 0; i <= window.innerWidth; i++) {
      ctx.lineTo(
        i,
        getHillY(i, baseHeight, speedMultiplier, amplitude, stretch)
      );
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawBackgroundTree = (
    ctx: CanvasRenderingContext2D,
    x: number,
    color: string
  ) => {
    const state = gameStateRef.current;
    ctx.save();
    ctx.translate(
      (-state.balloonX * hill1Speed + x) * hill1Stretch,
      getTreeY(x, hill1BaseHeight, hill1Amplitude)
    );

    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;

    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
      -treeTrunkWidth / 2,
      -treeTrunkHeight,
      treeTrunkWidth,
      treeTrunkHeight
    );

    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  };

  const drawBackgroundHills = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;

    drawHill(
      ctx,
      hill1BaseHeight,
      hill1Speed,
      hill1Amplitude,
      hill1Stretch,
      "#AAD155"
    );
    drawHill(
      ctx,
      hill2BaseHeight,
      hill2Speed,
      hill2Amplitude,
      hill2Stretch,
      "#84B249"
    );
    drawHill(
      ctx,
      hill3BaseHeight,
      hill3Speed,
      hill3Amplitude,
      hill3Stretch,
      "#26532B"
    );

    state.backgroundTrees.forEach((tree) =>
      drawBackgroundTree(ctx, tree.x, tree.color)
    );
  };

  const getDistance = (point1: Point, point2: Point): number => {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  };

  const hitDetection = (): boolean => {
    const state = gameStateRef.current;
    const cartBottomLeft = { x: state.balloonX - 30, y: state.balloonY };
    const cartBottomRight = { x: state.balloonX + 30, y: state.balloonY };
    const cartTopRight = { x: state.balloonX + 30, y: state.balloonY - 40 };

    for (const { x, h, r1, r2, r3, r4, r5 } of state.trees) {
      const treeBottomLeft = { x: x - 20, y: -h - 15 };
      const treeLeft = { x: x - 30, y: -h - 25 };
      const treeTopLeft = { x: x - 20, y: -h - 35 };
      const treeTop = { x: x, y: -h - 45 };
      const treeTopRight = { x: x + 20, y: -h - 35 };

      if (getDistance(cartBottomLeft, treeBottomLeft) < r1) return true;
      if (getDistance(cartBottomRight, treeBottomLeft) < r1) return true;
      if (getDistance(cartTopRight, treeBottomLeft) < r1) return true;
      if (getDistance(cartBottomLeft, treeLeft) < r2) return true;
      if (getDistance(cartBottomRight, treeLeft) < r2) return true;
      if (getDistance(cartTopRight, treeLeft) < r2) return true;
      if (getDistance(cartBottomLeft, treeTopLeft) < r3) return true;
      if (getDistance(cartBottomRight, treeTopLeft) < r3) return true;
      if (getDistance(cartTopRight, treeTopLeft) < r3) return true;
      if (getDistance(cartBottomLeft, treeTop) < r4) return true;
      if (getDistance(cartBottomRight, treeTop) < r4) return true;
      if (getDistance(cartTopRight, treeTop) < r4) return true;
      if (getDistance(cartBottomLeft, treeTopRight) < r5) return true;
      if (getDistance(cartBottomRight, treeTopRight) < r5) return true;
      if (getDistance(cartTopRight, treeTopRight) < r5) return true;
    }
    return false;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawSky(ctx);

    ctx.save();
    ctx.translate(0, state.verticalPadding + mainAreaHeight);
    drawBackgroundHills(ctx);
    ctx.translate(state.horizontalPadding, 0);
    ctx.translate(-state.balloonX, 0);

    drawTrees(ctx);
    drawBalloon(ctx);

    ctx.restore();
    drawHeader(ctx);
  }, []);

  const animate = useCallback(() => {
    if (!gameStarted) return;

    const state = gameStateRef.current;
    const velocityChangeWhileHeating = 0.4;
    const velocityChangeWhileCooling = 0.2;

    if (state.heating && state.fuel > 0) {
      if (state.verticalVelocity > -8) {
        state.verticalVelocity -= velocityChangeWhileHeating;
      }
      state.fuel -= 0.002 * -state.balloonY;
    } else if (state.verticalVelocity < 5) {
      state.verticalVelocity += velocityChangeWhileCooling;
    }

    state.balloonY += state.verticalVelocity;
    if (state.balloonY > 0) state.balloonY = 0;
    if (state.balloonY < 0) state.balloonX += state.horizontalVelocity;

    if (state.trees[0].x - (state.balloonX - state.horizontalPadding) < -100) {
      state.trees.shift();
      state.trees.push(generateTree());
    }

    if (
      state.backgroundTrees[0].x -
        (state.balloonX * hill1Speed - state.horizontalPadding) <
      -40
    ) {
      state.backgroundTrees.shift();
      state.backgroundTrees.push(generateBackgroundTree());
    }

    draw();

    const hit = hitDetection();
    if (hit || (state.fuel <= 0 && state.balloonY >= 0)) {
      setShowRestart(true);
      setGameStarted(false);
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [gameStarted, draw, generateTree, generateBackgroundTree]);

  const handleMouseDown = () => {
    const state = gameStateRef.current;
    state.heating = true;

    if (!gameStarted) {
      setShowIntro(false);
      setGameStarted(true);
    }
  };

  const handleMouseUp = () => {
    const state = gameStateRef.current;
    state.heating = false;
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        resetGame();
      }
    },
    [resetGame]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const state = gameStateRef.current;
      state.horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
      state.verticalPadding = (window.innerHeight - mainAreaHeight) / 2;
      draw();
    };

    handleResize();
    resetGame();

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, resetGame, handleKeyDown]);

  useEffect(() => {
    if (gameStarted) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, animate]);

  return (
    <div className="fixed inset-0 mt-14 overflow-hidden cursor-pointer select-none pt-16">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {showIntro && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-2000"
          style={{ opacity: showIntro ? 1 : 0 }}
        >
          <div className="text-center font-semibold text-sm bg-white/80 p-4 rounded-lg">
            <p>Hold down the mouse to raise</p>
            <p>Fly low to save fuel</p>
          </div>
        </div>
      )}

      {showRestart && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleRestart}
            className="w-30 h-30 bg-red-500 text-white font-bold text-xl rounded-full border-none cursor-pointer hover:bg-red-600 transition-colors px-8 py-4"
          >
            RESTART
          </button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-white/80 text-sm">
        <p>Press SPACE to restart</p>
        <p>Hold mouse to rise, release to fall</p>
      </div>
    </div>
  );
}
