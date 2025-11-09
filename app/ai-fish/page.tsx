"use client";
import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useResponsive } from "@/contexts/ResponsiveContext";

interface FishItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  bubbles: { x: number; y: number; life: number }[];
  image?: string;
  theta: number;
  phi: number;
}

interface Seaweed {
  x: number;
  height: number;
  sway: number;
}

interface Coral {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Turtle {
  x: number;
  y: number;
  vx: number;
}

interface Food {
  x: number;
  y: number;
  id: string;
  eaten: boolean;
}

export default function AIFishPage() {
  const { deviceType } = useResponsive();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const [showAddFish, setShowAddFish] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [food, setFood] = useState<Food[]>([]);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);
  const fishRef = useRef<FishItem[]>([
    {
      x: 100,
      y: 200,
      vx: 0.4,
      vy: 0.2,
      size: 30,
      color: "#FF6B6B",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
    {
      x: 300,
      y: 150,
      vx: -0.5,
      vy: 0.15,
      size: 30,
      color: "#4169E1",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
    {
      x: 500,
      y: 250,
      vx: 0.35,
      vy: -0.18,
      size: 30,
      color: "#FFD700",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
  ]);

  const seaweedRef = useRef<Seaweed[]>([
    { x: 50, height: 80, sway: 0 },
    { x: 150, height: 60, sway: 0 },
    { x: 250, height: 90, sway: 0 },
    { x: 350, height: 70, sway: 0 },
    { x: 450, height: 85, sway: 0 },
    { x: 550, height: 65, sway: 0 },
  ]);

  const coralsRef = useRef<Coral[]>([
    { x: 100, y: 350, width: 40, height: 60, color: "#FF6B9D" },
    { x: 400, y: 360, width: 35, height: 50, color: "#4ECDC4" },
    { x: 600, y: 340, width: 45, height: 70, color: "#F7DC6F" },
  ]);

  const turtleRef = useRef<Turtle>({ x: 200, y: 320, vx: 0.15 });
  const clickedCreatureRef = useRef<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomFish = () => {
    if (uploadedImage) {
      const newFish: FishItem = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
        vx: (Math.random() * 0.15 + 0.25) * (Math.random() > 0.5 ? 1 : -1), // 与默认鱼速度一致
        vy: (Math.random() * 0.1 + 0.15) * (Math.random() > 0.5 ? 1 : -1),
        size: 50, // 稍微小一点，更协调
        color: "#FFD700",
        bubbles: [],
        image: uploadedImage,
        theta: 0,
        phi: 0,
      };
      fishRef.current = [...fishRef.current, newFish];
      setUploadedImage(null);
      setShowAddFish(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const handleFoodTouchStart =
    (foodItem: Food) => (event: React.TouchEvent) => {
      event.preventDefault();
      setDraggedFood(foodItem);
    };

  const handleCanvasDropReact = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createFood(x, y);
    }
    setDraggedFood(null);
  };

  const handleCanvasDragOverReact = (
    event: React.DragEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasTouchStart = (
    event: React.TouchEvent<HTMLCanvasElement>
  ) => {};

  const handleCanvasTouchMove = (
    event: React.TouchEvent<HTMLCanvasElement>
  ) => {};

  const handleCanvasTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = event.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (draggedFood && y > 50) {
      createFood(x, y);
    }
    setDraggedFood(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isAnimating = true;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      fishRef.current.forEach((f, index) => {
        const distance = Math.sqrt((x - f.x) ** 2 + (y - f.y) ** 2);
        if (distance < f.size) {
          clickedCreatureRef.current = `fish-${index}`;
          // 只改变水平方向，实现左右翻转效果
          f.vx *= -1;
          setTimeout(() => (clickedCreatureRef.current = null), 500);
        }
      });

      const turtle = turtleRef.current;
      const turtleDistance = Math.sqrt(
        (x - turtle.x - 20) ** 2 + (y - turtle.y - 12) ** 2
      );
      if (turtleDistance < 30) {
        clickedCreatureRef.current = "turtle";
        turtle.vx *= -1;
        setTimeout(() => (clickedCreatureRef.current = null), 500);
      }

      seaweedRef.current.forEach((weed, index) => {
        const distance = Math.sqrt((x - weed.x) ** 2 + (y - 400) ** 2);
        if (distance < 30) {
          clickedCreatureRef.current = `seaweed-${index}`;
          weed.sway += Math.PI;
          setTimeout(() => (clickedCreatureRef.current = null), 500);
        }
      });

      coralsRef.current.forEach((coral, index) => {
        if (
          x >= coral.x &&
          x <= coral.x + coral.width &&
          y >= coral.y &&
          y <= coral.y + coral.height
        ) {
          clickedCreatureRef.current = `coral-${index}`;
          setTimeout(() => (clickedCreatureRef.current = null), 500);
        }
      });
    };

    const onCanvasDropNative = (ev: Event) => {
      const event = ev as DragEvent;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (rect && typeof event.clientX === "number") {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setFood((prev) => [...prev, {
          x,
          y,
          id: Date.now().toString(),
          eaten: false,
        }]);
      }
      setDraggedFood(null);
    };

    const onCanvasDragOverNative = (ev: Event) => {
      const event = ev as DragEvent;
      event.preventDefault();
    };

    const handleCanvasTouchEndNative = (ev: Event) => {
      const event = ev as TouchEvent;
      const rect = canvas.getBoundingClientRect();
      if (rect && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (y > 50) {
          setFood((prev) => [...prev, {
            x,
            y,
            id: Date.now().toString(),
            eaten: false,
          }]);
        }
      }
      setDraggedFood(null);
    };

    const handleCanvasTouchMoveNative = (ev: Event) => {
      const event = ev as TouchEvent;
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("drop", onCanvasDropNative);
    canvas.addEventListener("dragover", onCanvasDragOverNative);
    canvas.addEventListener("touchend", handleCanvasTouchEndNative);
    canvas.addEventListener("touchmove", handleCanvasTouchMoveNative, {
      passive: true,
    });

    const animate = (now?: number) => {
      if (!isAnimating) return;
      try {
        const current = typeof now === "number" ? now : performance.now();
        const last = lastTimeRef.current ?? current;
        const deltaTime = current - last;
        const dtScale = Math.max(0.5, Math.min(2, deltaTime / 16.6667 || 1));
        lastTimeRef.current = current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawSeaEnvironment(ctx, canvas.width, canvas.height);
        drawSeaweed(ctx, seaweedRef.current, dtScale);
        drawCorals(ctx, coralsRef.current);
        drawTurtle(ctx, turtleRef.current, clickedCreatureRef.current === "turtle", dtScale);
        checkTurtleEatFood(turtleRef.current, food, setFood);
        fishRef.current = updateAndDrawFish(
          ctx,
          fishRef.current,
          clickedCreatureRef.current,
          food,
          setFood,
          dtScale
        );
        drawFood(ctx, food, fishRef.current);

        if (isAnimating) {
          animationRef.current = requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error("Animation error:", error);
        isAnimating = false;
      }
    };

    animate();

    return () => {
      isAnimating = false;
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("drop", onCanvasDropNative);
      canvas.removeEventListener("dragover", onCanvasDragOverNative);
      canvas.removeEventListener("touchend", handleCanvasTouchEndNative);
      canvas.removeEventListener("touchmove", handleCanvasTouchMoveNative);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      lastTimeRef.current = null;
    };
  }, []);

  const drawSeaEnvironment = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(0.5, "#4682B4");
    gradient.addColorStop(1, "#2F4F4F");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height * 0.8,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();
    }
  };

  const drawSeaweed = (
    ctx: CanvasRenderingContext2D,
    seaweedArr: Seaweed[],
    dtScale: number
  ) => {
    seaweedArr.forEach((weed, index) => {
      weed.sway += 0.02 * dtScale;
      const isClicked = clickedCreatureRef.current === `seaweed-${index}`;
      const swayOffset = Math.sin(weed.sway + index) * (isClicked ? 15 : 5);
      const time = Date.now() * 0.001;

      ctx.strokeStyle = "#228B22";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(weed.x, 400);
      for (let i = 0; i < weed.height; i += 10) {
        const wave = Math.sin(time + i * 0.1) * 2;
        ctx.lineTo(weed.x + swayOffset * (i / weed.height) + wave, 400 - i);
      }
      ctx.stroke();

      ctx.fillStyle = "#32CD32";
      for (let i = 0; i < 5; i++) {
        const leafY = 400 - (i * weed.height) / 5;
        const leafWave = Math.sin(time + i * 0.5) * 3;
        ctx.beginPath();
        ctx.ellipse(
          weed.x + swayOffset + leafWave,
          leafY,
          8,
          3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  };

  const drawCorals = (ctx: CanvasRenderingContext2D, coralsArr: Coral[]) => {
    coralsArr.forEach((coral, index) => {
      const isClicked = clickedCreatureRef.current === `coral-${index}`;
      ctx.save();
      if (isClicked) {
        ctx.scale(1.2, 1.2);
        ctx.translate(-coral.x * 0.1, -coral.y * 0.1);
      }
      ctx.fillStyle = coral.color;
      ctx.beginPath();
      ctx.moveTo(coral.x, coral.y + coral.height);
      ctx.lineTo(coral.x + coral.width / 2, coral.y);
      ctx.lineTo(coral.x + coral.width, coral.y + coral.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = coral.color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          coral.x + coral.width / 2 + (i - 1) * 10,
          coral.y - 10,
          5,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  const drawTurtle = (
    ctx: CanvasRenderingContext2D,
    turtleObj: Turtle,
    isClicked: boolean = false,
    dtScale: number = 1
  ) => {
    turtleObj.x += turtleObj.vx * dtScale;
    if (turtleObj.x > 800) turtleObj.x = -50;
    if (turtleObj.x < -60) turtleObj.x = 800;

    ctx.save();
    ctx.translate(turtleObj.x, turtleObj.y);
    
    if (isClicked) {
      ctx.scale(1.3, 1.3);
    }

    // 翻转乌龟方向
    if (turtleObj.vx < 0) {
      ctx.scale(-1, 1);
    }

    // 四肢（鳍状）
    ctx.fillStyle = "#5F8A3D";
    // 前左腿
    ctx.beginPath();
    ctx.ellipse(-8, 8, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // 前右腿
    ctx.beginPath();
    ctx.ellipse(-8, 20, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // 后左腿
    ctx.beginPath();
    ctx.ellipse(32, 8, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // 后右腿
    ctx.beginPath();
    ctx.ellipse(32, 20, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 龟壳（椭圆形）
    ctx.fillStyle = "#8B6914";
    ctx.beginPath();
    ctx.ellipse(12, 14, 22, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 龟壳花纹
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 1.5;
    // 中央六边形
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = 12 + Math.cos(angle) * 8;
      const y = 14 + Math.sin(angle) * 6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // 外围小格子
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.beginPath();
      ctx.moveTo(12, 14);
      ctx.lineTo(12 + Math.cos(angle) * 18, 14 + Math.sin(angle) * 13);
      ctx.stroke();
    }

    // 头部
    ctx.fillStyle = "#5F8A3D";
    ctx.beginPath();
    ctx.ellipse(-18, 14, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(-20, 11, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-20, 17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-19.5, 11, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-19.5, 17, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 小尾巴
    ctx.fillStyle = "#5F8A3D";
    ctx.beginPath();
    ctx.moveTo(34, 14);
    ctx.lineTo(40, 12);
    ctx.lineTo(40, 16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawFood = (
    ctx: CanvasRenderingContext2D,
    foodArr: Food[],
    allFish: FishItem[]
  ) => {
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

  const checkTurtleEatFood = (
    turtleObj: Turtle,
    foodArr: Food[],
    setFoodFn: React.Dispatch<React.SetStateAction<Food[]>>
  ) => {
    const remainingFood = foodArr.filter((foodItem) => {
      const dx = foodItem.x - turtleObj.x - 12;
      const dy = foodItem.y - turtleObj.y - 14;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist >= 30; // 乌龟吃食范围
    });
    
    if (remainingFood.length < foodArr.length) {
      setFoodFn(remainingFood);
    }
  };

  const drawFish = (ctx: CanvasRenderingContext2D, fish: FishItem) => {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    
    if (fish.image) {
      // 对于自定义图片，根据游动方向旋转和翻转
      const angle = Math.atan2(fish.vy, fish.vx);
      ctx.rotate(angle);
      
      // 根据水平方向决定是否翻转图片
      if (fish.vx < 0) {
        ctx.scale(1, -1); // 向左游时垂直翻转
      }
      
      const img = new Image();
      img.src = fish.image;
      const scale = fish.size / 30;
      const imgWidth = 60 * scale;
      const imgHeight = 30 * scale;

      if (img.complete) {
        ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      } else {
        // 图片未加载完成时显示默认鱼
        if (fish.vx < 0) {
          ctx.scale(1, -1); // 恢复翻转
        }
        ctx.rotate(-angle); // 恢复旋转
        ctx.rotate(Math.PI + angle);
        ctx.scale(1, fish.vx < 0 ? -1 : 1);
        drawDefaultFish(ctx, fish, scale);
      }
    } else {
      // 默认鱼使用原来的旋转方式
      ctx.rotate(Math.PI + Math.atan2(fish.vy, fish.vx));
      ctx.scale(1, fish.vx < 0 ? -1 : 1);
      drawDefaultFish(ctx, fish, fish.size / 30);
    }

    ctx.restore();
  };

  const drawDefaultFish = (
    ctx: CanvasRenderingContext2D,
    fish: FishItem,
    scale: number
  ) => {
    ctx.scale(scale, scale);

    // 鱼身体
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.bezierCurveTo(-20, 15, 15, 10, 40, 0);
    ctx.bezierCurveTo(15, -10, -20, -15, -30, 0);
    ctx.fill();

    // 尾巴
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

    // 鱼鳍 - 根据鱼的方向决定在上侧还是下侧，朝向鱼尾方向
    const finSide = fish.vx < 0 ? 1 : -1; // 鱼向左游时鱼鳍在上，向右游时在下
    ctx.save();
    ctx.translate(10, 0); // 移到鱼身中后部
    ctx.rotate(
      (-Math.PI / 2.5 + (Math.PI / 10) * Math.sin(fish.phi)) * finSide
    );

    ctx.beginPath();
    if (finSide > 0) {
      // 鱼鳍向后（向尾巴方向）
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15, 5, 20, 15, 25, 25);
      ctx.bezierCurveTo(15, 20, 8, 12, 0, 0);
    } else {
      // 鱼鳍向后（向尾巴方向）
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15, -5, 20, -15, 25, -25);
      ctx.bezierCurveTo(15, -20, 8, -12, 0, 0);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 眼睛 - 与鱼鳍在同一侧
    const eyeY = finSide > 0 ? -5 : 5;
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(-25, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-23, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const updateAndDrawFish = (
    ctx: CanvasRenderingContext2D,
    fishArr: FishItem[],
    clickedCreatureId: string | null = null,
    foodArr: Food[],
    setFoodFn?: React.Dispatch<React.SetStateAction<Food[]>>,
    dtScale: number = 1
  ): FishItem[] => {
    const time = Date.now() * 0.001;

    const updatedFish = fishArr.map((f) => {
      let closestFood: Food | null = null;
      let closestDistance = Infinity;

      foodArr.forEach((foodItem: Food) => {
        const distance = Math.sqrt(
          (f.x - foodItem.x) ** 2 + (f.y - foodItem.y) ** 2
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestFood = foodItem;
        }
      });

      if (closestFood && closestDistance < 300) {
        const dx = (closestFood as Food).x - f.x;
        const dy = (closestFood as Food).y - f.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          f.vx = (dx / distance) * 0.6;
          f.vy = (dy / distance) * 0.6;
        }
      } else {
        if (Math.random() < 0.02) {
          f.vx += (Math.random() - 0.5) * 0.2;
          f.vy += (Math.random() - 0.5) * 0.2;
        }

        const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        const maxSpeed = 0.8;
        if (speed > maxSpeed) {
          f.vx = (f.vx / speed) * maxSpeed;
          f.vy = (f.vy / speed) * maxSpeed;
        }
      }

      f.x += f.vx * dtScale;
      f.y += f.vy * dtScale;

      if (f.x < 0) {
        f.x = 0;
        f.vx *= -1;
      } else if (f.x > ctx.canvas.width) {
        f.x = ctx.canvas.width;
        f.vx *= -1;
      }

      if (f.y < 50) {
        f.y = 50;
        f.vy *= -1;
      } else if (f.y > ctx.canvas.height - 50) {
        f.y = ctx.canvas.height - 50;
        f.vy *= -1;
      }

      if (Math.random() < 0.01) {
        f.bubbles.push({ x: f.x, y: f.y, life: 60 });
      }

      f.bubbles = f.bubbles.filter((bubble) => {
        bubble.y -= 1 * dtScale;
        bubble.life -= 1 * dtScale;
        return bubble.life > 0;
      });

      f.theta += (Math.PI / 20) * dtScale;
      f.phi += (Math.PI / 30) * dtScale;

      return f;
    });

    updatedFish.forEach((f) => {
      drawFish(ctx, f);

      f.bubbles.forEach((bubble) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.life / 60})`;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    if (setFoodFn) {
      const remainingFood: Food[] = [...foodArr];
      for (let i = remainingFood.length - 1; i >= 0; i--) {
        const foodItem = remainingFood[i];
        let eatenByFish: FishItem | null = null;
        for (const fishItem of updatedFish) {
          const dx = foodItem.x - fishItem.x;
          const dy = foodItem.y - fishItem.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < fishItem.size / 2 + 6) {
            eatenByFish = fishItem;
            if (!eatenByFish.bubbles) eatenByFish.bubbles = [];
            eatenByFish.bubbles.push({
              x: eatenByFish.x,
              y: eatenByFish.y,
              life: 30,
            });
            remainingFood.splice(i, 1);
            break;
          }
        }
      }
      setFoodFn(remainingFood);
    }

    return updatedFish;
  };

  return (
    <div
      className="w-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 relative w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-b from-blue-300/50 to-blue-600/50"
            onDrop={handleCanvasDropReact}
            onDragOver={handleCanvasDragOverReact}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
          />

          <div
            className={`absolute ${
              deviceType === "mobile" ? "right-2 top-4" : "right-4 top-4"
            } bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg`}
          >
            <button
              onClick={() => setShowAddFish(true)}
              className={`mb-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-1 justify-center w-full ${
                deviceType === "mobile" ? "text-xs" : "text-sm"
              }`}
            >
              <Plus size={deviceType === "mobile" ? 14 : 16} />
              Add Fish
            </button>

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
                      onTouchStart={handleFoodTouchStart(foodItem)}
                      title="Drag to feed fish"
                    />
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddFish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2
              className={`font-bold mb-3 text-gray-800 ${
                deviceType === "mobile" ? "text-lg" : "text-xl"
              }`}
            >
              Add Your Fish
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  className={`block font-medium text-gray-700 mb-1 ${
                    deviceType === "mobile" ? "text-xs" : "text-sm"
                  }`}
                >
                  Upload Fish Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    deviceType === "mobile" ? "text-xs" : "text-sm"
                  }`}
                />
              </div>
              {uploadedImage && (
                <div className="text-center">
                  <p
                    className={`text-gray-600 mb-1 ${
                      deviceType === "mobile" ? "text-xs" : "text-sm"
                    }`}
                  >
                    Preview:
                  </p>
                  <img
                    src={uploadedImage}
                    alt="Fish preview"
                    className={`object-cover rounded-lg mx-auto border-2 border-blue-200 ${
                      deviceType === "mobile" ? "w-16 h-16" : "w-20 h-20"
                    }`}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddFish(false);
                    setUploadedImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className={`flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded-lg transition-colors ${
                    deviceType === "mobile" ? "text-xs" : "text-sm"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomFish}
                  disabled={!uploadedImage}
                  className={`flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-1 px-2 rounded-lg transition-colors ${
                    deviceType === "mobile" ? "text-xs" : "text-sm"
                  }`}
                >
                  Add Fish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}