"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useResponsive } from "@/contexts/ResponsiveContext";

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
  color: string;
  id: number;
}

interface Food {
  x: number;
  y: number;
  id: string;
  eaten: boolean;
}

const POINT_INTERVAL = 5;
const FISH_COUNT = 4;
const MAX_INTERVAL_COUNT = 50;
const INIT_HEIGHT_RATE = 0.9;
const THRESHOLD = 50;
const SPRING_CONSTANT = 0.03;
const SPRING_FRICTION = 0.9;
const WAVE_SPREAD = 0.3;
const ACCELERATION_RATE = 0.01;
const GRAVITY = 0.4;

export default function SmallFishPage() {
  const { deviceType } = useResponsive();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(true);
  const [food, setFood] = useState<Food[]>([]);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);

  const rendererRef = useRef({
    width: 0,
    height: 0,
    points: [] as SurfacePoint[],
    fishes: [] as Fish[],
    intervalCount: MAX_INTERVAL_COUNT,
    reverse: false,
    pointInterval: 0,
    fishCount: 0,
    axis: null as { x: number; y: number } | null,
  });

  const getRandomValue = useCallback((min: number, max: number): number => {
    return min + (max - min) * Math.random();
  }, []);

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
      force: { previous: 0, next: 0 },
    };
    renderer.points.push(firstPoint);

    for (let i = 1; i < count; i++) {
      const point: SurfacePoint = {
        x: i * renderer.pointInterval,
        height: renderer.height * INIT_HEIGHT_RATE,
        initHeight: renderer.height * INIT_HEIGHT_RATE,
        fy: 0,
        force: { previous: 0, next: 0 },
      };

      const previous = renderer.points[i - 1];
      point.previous = previous;
      previous.next = point;
      renderer.points.push(point);
    }
  };

  const createFish = useCallback(
    (index: number): Fish => {
      const renderer = rendererRef.current;
      const direction = Math.random() < 0.5;

      // 定义4种颜色的鱼，确保每种颜色只有一条鱼
      const colors = ["#FF6B6B", "#4169E1", "#87CEEB", "#FFD700"]; // 红色、蓝色、浅蓝色、黄色
      const color = colors[index % colors.length]; // 根据索引分配颜色

      const fish: Fish = {
        id: index, // 添加ID
        direction,
        x: direction ? renderer.width + THRESHOLD : -THRESHOLD,
        y: 0,
        previousY: 0,
        vx: getRandomValue(1, 3) * (direction ? -1 : 1),
        vy: 0,
        ay: 0,
        isOut: false,
        theta: 0,
        phi: 0,
        color,
      };

      if (renderer.reverse) {
        fish.y = getRandomValue(renderer.height * 0.1, renderer.height * 0.3);
        fish.vy = getRandomValue(0.5, 1.5);
        fish.ay = getRandomValue(0.01, 0.05);
      } else {
        // 确保鱼在水面下方合适的位置生成
        const waterSurfaceY = renderer.height * INIT_HEIGHT_RATE;
        fish.y = getRandomValue(waterSurfaceY + 20, renderer.height * 0.8);
        fish.vy = getRandomValue(-1.5, -0.5);
        fish.ay = getRandomValue(-0.05, -0.01);
      }

      fish.previousY = fish.y;
      return fish;
    },
    [getRandomValue]
  );

  const createFood = (x: number, y: number) => {
    const newFood: Food = {
      x,
      y,
      id: Date.now().toString(),
      eaten: false,
    };
    setFood((prev) => [...prev, newFood]);
  };

  const handleFoodDragStart = (foodItem: Food) => (event: React.DragEvent) => {
    setDraggedFood(foodItem);
    event.dataTransfer.setData("text/plain", foodItem.id);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createFood(x, y);
    }
    setDraggedFood(null);
  };

  const handleCanvasDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const generateEpicenter = (x: number, y: number, velocity: number) => {
    const renderer = rendererRef.current;
    if (
      y < renderer.height / 2 - THRESHOLD ||
      y > renderer.height / 2 + THRESHOLD
    ) {
      return;
    }

    const index = Math.round(x / renderer.pointInterval);
    if (index < 0 || index >= renderer.points.length) {
      return;
    }

    const point = renderer.points[index];
    point.fy =
      renderer.height *
      ACCELERATION_RATE *
      (renderer.height - point.height - y >= 0 ? -1 : 1) *
      Math.abs(velocity);
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
        point.force.previous =
          WAVE_SPREAD * (point.height - point.previous.height);
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

  const updateFish = useCallback(
    (fish: Fish) => {
      const renderer = rendererRef.current;
      fish.previousY = fish.y;
      fish.x += fish.vx;
      fish.y += fish.vy;
      fish.vy += fish.ay;

      // Find the closest food if any exists
      let closestFood: Food | null = null;
      let closestDistance = Infinity;

      food.forEach((foodItem: Food) => {
        const distance = Math.sqrt(
          (fish.x - foodItem.x) ** 2 + (fish.y - foodItem.y) ** 2
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestFood = foodItem;
        }
      });

      // If there's food nearby, move towards it
      if (closestFood && closestDistance < 200) {
        const dx = (closestFood as Food).x - fish.x;
        const dy = (closestFood as Food).y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          fish.vx = (dx / distance) * 1.5;
          fish.vy = (dy / distance) * 1.5;
        }
      }

      // 定义边界
      const waterSurfaceY = renderer.height * INIT_HEIGHT_RATE;
      const topBoundary = waterSurfaceY + 5; // 水面以下5像素
      const bottomBoundary = renderer.height - 25; // 距离画布底部25像素

      // 左右边界检查
      if (fish.x < -THRESHOLD) {
        fish.x = -THRESHOLD;
        fish.vx = Math.abs(fish.vx); // 反转方向
      } else if (fish.x > renderer.width + THRESHOLD) {
        fish.x = renderer.width + THRESHOLD;
        fish.vx = -Math.abs(fish.vx); // 反转方向
      }

      // 上下边界检查
      // 上边界检查（不能游到水面上）
      if (fish.y < topBoundary) {
        fish.y = topBoundary;
        fish.vy = Math.abs(fish.vy); // 向下反弹
      }
      // 下边界检查（不能游出画布底部）
      else if (fish.y > bottomBoundary) {
        fish.y = bottomBoundary;
        fish.vy = -Math.abs(fish.vy); // 向上反弹
      }

      // 保持鱼在水面下区域活动
      if (renderer.reverse) {
        if (fish.y > waterSurfaceY) {
          fish.vy -= GRAVITY;
          fish.isOut = true;
        } else {
          if (fish.isOut) {
            fish.ay = getRandomValue(0.01, 0.05);
          }
          fish.isOut = false;
        }
      } else {
        if (fish.y < waterSurfaceY) {
          fish.vy += GRAVITY;
          fish.isOut = true;
        } else {
          if (fish.isOut) {
            fish.ay = getRandomValue(-0.05, -0.01);
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

      // 当鱼游到屏幕边缘时反转方向而不是重新创建
      if (
        (fish.vx > 0 && fish.x > renderer.width + THRESHOLD) ||
        (fish.vx < 0 && fish.x < -THRESHOLD)
      ) {
        fish.vx = -fish.vx; // 反转方向
      }
    },
    [getRandomValue, food]
  );

  const drawFish = (ctx: CanvasRenderingContext2D, fish: Fish) => {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(Math.PI + Math.atan2(fish.vy, fish.vx));
    ctx.scale(1, fish.direction ? 1 : -1);

    ctx.fillStyle = fish.color;
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
    ctx.rotate(
      (Math.PI / 3 + (Math.PI / 10) * Math.sin(fish.phi)) *
        (rendererRef.current.reverse ? -1 : 1)
    );

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

    ctx.save();
    ctx.translate(-20, -10);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(2, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  const drawFood = (ctx: CanvasRenderingContext2D, foodArr: Food[]) => {
    foodArr.forEach((f: Food) => {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(f.x - 2, f.y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = rendererRef.current;
    renderer.width = container.offsetWidth;
    renderer.height = container.offsetHeight;
    renderer.fishCount = FISH_COUNT;

    canvas.width = renderer.width;
    canvas.height = renderer.height;

    renderer.points = [];
    renderer.fishes = [];
    renderer.intervalCount = MAX_INTERVAL_COUNT;

    // 创建4条不同颜色的鱼
    for (let i = 0; i < FISH_COUNT; i++) {
      renderer.fishes.push(createFish(i));
    }
    createSurfacePoints();
  }, [createFish]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const axis = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
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
      y: event.clientY - rect.top,
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
          renderer.fishes.push(createFish(renderer.fishes.length));
        }
      }

      for (const fish of renderer.fishes) {
        updateFish(fish);
      }

      // Check for fish-food collisions
      const remainingFood = [...food];
      for (let i = remainingFood.length - 1; i >= 0; i--) {
        const foodItem = remainingFood[i];
        for (const fish of renderer.fishes) {
          const dx = foodItem.x - fish.x;
          const dy = foodItem.y - fish.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) {
            remainingFood.splice(i, 1);
            break;
          }
        }
      }
      if (remainingFood.length !== food.length) {
        setFood(remainingFood);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, renderer.width, renderer.height);

      drawFood(ctx, food);

      for (const fish of renderer.fishes) {
        drawFish(ctx, fish);
      }

      ctx.save();
      ctx.globalCompositeOperation = "xor";
      ctx.fillStyle = "rgba(135, 206, 235, 0.3)";
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
  }, [isRunning, setup, updateFish, createFish]);

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setup();
  };

  return (
    <div
      className="h-full bg-gradient-to-b from-blue-100 relative overflow-hidden"
      style={{ overflowX: "hidden" }}
    >
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 w-full h-148 opacity-90 z-50"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        style={{ cursor: "pointer" }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Fish Food Controls */}
      <div
        className={`absolute ${
          deviceType === "mobile" ? "right-2 top-4" : "right-4 top-4"
        } bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg z-50`}
      >
        <div
          className={`text-white font-medium mb-1 ${
            deviceType === "mobile" ? "text-xs" : "text-sm"
          }`}
        >
          Fish Food
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: deviceType === "mobile" ? 4 : 6 }).map(
            (_, i) => {
              const foodItem: Food = {
                x: 0,
                y: 0,
                id: `food-${i}`,
                eaten: false,
              };
              return (
                <div
                  key={i}
                  className={`rounded-full cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${
                    deviceType === "mobile" ? "w-6 h-6" : "w-8 h-8"
                  } bg-yellow-400 border-2 border-yellow-500 shadow-lg`}
                  draggable={true}
                  onDragStart={handleFoodDragStart(foodItem)}
                  title="Drag to feed fish"
                />
              );
            }
          )}
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center pb-30 px-4">
        {" "}
        <div className="text-center mt-24 text-blue-800 max-w-2xl">
          <h1 className="font-bold mb-4 text-2xl">Small Fish Animation</h1>
        </div>
      </main>
    </div>
  );
}
