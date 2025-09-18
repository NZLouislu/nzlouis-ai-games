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
  theta?: number;
  phi?: number;
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
  const [showAddFish, setShowAddFish] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [food, setFood] = useState<Food[]>([]);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);

  const [fish, setFish] = useState<FishItem[]>([
    {
      x: 100,
      y: 200,
      vx: 1,
      vy: 0.5,
      size: 60,
      color: "#FF6B6B",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
    {
      x: 300,
      y: 150,
      vx: -1.2,
      vy: 0.3,
      size: 50,
      color: "#4ECDC4",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
    {
      x: 500,
      y: 250,
      vx: 0.8,
      vy: -0.4,
      size: 70,
      color: "#45B7D1",
      bubbles: [],
      theta: 0,
      phi: 0,
    },
  ]);

  const [seaweed] = useState<Seaweed[]>([
    { x: 50, height: 80, sway: 0 },
    { x: 150, height: 60, sway: 0 },
    { x: 250, height: 90, sway: 0 },
    { x: 350, height: 70, sway: 0 },
    { x: 450, height: 85, sway: 0 },
    { x: 550, height: 65, sway: 0 },
  ]);

  const [corals] = useState<Coral[]>([
    { x: 100, y: 350, width: 40, height: 60, color: "#FF6B9D" },
    { x: 400, y: 360, width: 35, height: 50, color: "#4ECDC4" },
    { x: 600, y: 340, width: 45, height: 70, color: "#F7DC6F" },
  ]);

  const [turtle] = useState<Turtle>({ x: 200, y: 320, vx: 0.3 });
  const [clickedCreature, setClickedCreature] = useState<string | null>(null);

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
        x: Math.random() * 600 + 100,
        y: Math.random() * 200 + 100,
        vx: (Math.random() * 0.4 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        size: 60,
        color: "#FFD700",
        bubbles: [],
        image: uploadedImage,
        theta: 0,
        phi: 0,
      };
      setFish((prev) => [...prev, newFish]);
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
  };

  const handleCanvasDropReact = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (draggedFood) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        createFood(x, y);
        setFood((prev) => prev.filter((f) => f.id !== draggedFood.id));
      }
    }
    setDraggedFood(null);
  };

  const handleCanvasDragOverReact = (
    event: React.DragEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
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

      fish.forEach((f, index) => {
        const distance = Math.sqrt((x - f.x) ** 2 + (y - f.y) ** 2);
        if (distance < f.size) {
          setClickedCreature(`fish-${index}`);
          f.vx *= -1;
          f.vy *= -1;
          setTimeout(() => setClickedCreature(null), 500);
        }
      });

      const turtleDistance = Math.sqrt(
        (x - turtle.x - 20) ** 2 + (y - turtle.y - 12) ** 2
      );
      if (turtleDistance < 30) {
        setClickedCreature("turtle");
        turtle.vx *= -1;
        setTimeout(() => setClickedCreature(null), 500);
      }

      seaweed.forEach((weed, index) => {
        const distance = Math.sqrt((x - weed.x) ** 2 + (y - 400) ** 2);
        if (distance < 30) {
          setClickedCreature(`seaweed-${index}`);
          weed.sway += Math.PI;
          setTimeout(() => setClickedCreature(null), 500);
        }
      });

      corals.forEach((coral, index) => {
        if (x >= coral.x && x <= coral.x + coral.width && 
            y >= coral.y && y <= coral.y + coral.height) {
          setClickedCreature(`coral-${index}`);
          setTimeout(() => setClickedCreature(null), 500);
        }
      });
    };

    const onCanvasDropNative = (ev: Event) => {
      const event = ev as DragEvent;
      event.preventDefault();
      if (draggedFood) {
        const rect = canvas.getBoundingClientRect();
        if (rect && typeof event.clientX === "number") {
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          createFood(x, y);
          setFood((prev) => prev.filter((f) => f.id !== draggedFood.id));
        }
      }
      setDraggedFood(null);
    };

    const onCanvasDragOverNative = (ev: Event) => {
      const event = ev as DragEvent;
      event.preventDefault();
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("drop", onCanvasDropNative);
    canvas.addEventListener("dragover", onCanvasDragOverNative);

    const animate = () => {
      if (!isAnimating) return;

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawSeaEnvironment(ctx, canvas.width, canvas.height);
        drawSeaweed(ctx, seaweed);
        drawCorals(ctx, corals);
        drawTurtle(ctx, turtle, clickedCreature === "turtle");
        updateAndDrawFish(ctx, fish, setFish, clickedCreature);
        drawFood(ctx, food, setFood, fish);

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
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
    seaweedArr: Seaweed[]
  ) => {
    seaweedArr.forEach((weed, index) => {
      weed.sway += 0.02;
      const isClicked = clickedCreature === `seaweed-${index}`;
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
      const isClicked = clickedCreature === `coral-${index}`;
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
    isClicked: boolean = false
  ) => {
    turtleObj.x += turtleObj.vx;
    if (turtleObj.x > 800) turtleObj.x = -50;

    ctx.save();
    if (isClicked) {
      ctx.scale(1.2, 1.2);
      ctx.translate(-turtleObj.x * 0.1, -turtleObj.y * 0.1);
    }

    ctx.fillStyle = "#8B4513";
    ctx.fillRect(turtleObj.x, turtleObj.y, 40, 25);

    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(turtleObj.x + 10, turtleObj.y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(turtleObj.x + 8, turtleObj.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawFood = (
    ctx: CanvasRenderingContext2D,
    foodArr: Food[],
    setFoodFn: React.Dispatch<React.SetStateAction<Food[]>>,
    allFish: FishItem[]
  ) => {
    const updatedFood = foodArr
      .map((f) => {
        if (f.eaten) return f;
        allFish.forEach((fishItem) => {
          const distance = Math.sqrt(
            (f.x - fishItem.x) ** 2 + (f.y - fishItem.y) ** 2
          );
          if (distance < fishItem.size) {
            f.eaten = true;
            fishItem.bubbles.push({ x: fishItem.x, y: fishItem.y, life: 30 });
          }
        });
        return f;
      })
      .filter((f) => !f.eaten || f.eaten);

    updatedFood.forEach((f) => {
      if (!f.eaten) {
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#D2691E";
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    setFoodFn(updatedFood.filter((f) => !f.eaten));
  };

  const updateAndDrawFish = (
    ctx: CanvasRenderingContext2D,
    fishArr: FishItem[],
    setFishFn: React.Dispatch<React.SetStateAction<FishItem[]>>,
    clickedCreatureId: string | null = null
  ) => {
    const time = Date.now() * 0.001;

    const updatedFish = fishArr.map((f) => {
      f.x += f.vx;
      f.y += f.vy;

      if (f.x < 0 || f.x > ctx.canvas.width) f.vx *= -1;
      if (f.y < 50 || f.y > ctx.canvas.height - 50) f.vy *= -1;

      if (Math.random() < 0.01) {
        f.bubbles.push({ x: f.x, y: f.y, life: 60 });
      }

      f.bubbles = f.bubbles.filter((bubble) => {
        bubble.y -= 1;
        bubble.life -= 1;
        return bubble.life > 0;
      });

      if (!f.theta) f.theta = 0;
      if (!f.phi) f.phi = 0;
      f.theta += Math.PI / 20;
      f.phi += Math.PI / 30;

      return f;
    });

    updatedFish.forEach((f, index) => {
      const isClicked = clickedCreatureId === `fish-${index}`;

      ctx.save();
      if (isClicked) {
        ctx.scale(1.3, 1.3);
        ctx.translate(-f.x * 0.15, -f.y * 0.15);
      }

      if (f.image) {
        const img = new Image();
        img.src = f.image;
        img.onload = () => {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(Math.atan2(f.vy, f.vx));
          if (f.vx < 0) {
            ctx.scale(1, -1);
          }
          ctx.drawImage(img, -f.size / 2, -f.size / 2, f.size, f.size);
          ctx.restore();
        };
        if (img.complete) {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(Math.atan2(f.vy, f.vx));
          if (f.vx < 0) {
            ctx.scale(1, -1);
          }
          ctx.drawImage(img, -f.size / 2, -f.size / 2, f.size, f.size);
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(Math.atan2(f.vy, f.vx));
        ctx.scale(f.vx > 0 ? 1 : -1, 1);

        // Draw fish body with bezier curves
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.8, 0);
        ctx.bezierCurveTo(
          -f.size * 0.5,
          f.size * 0.4,
          f.size * 0.3,
          f.size * 0.25,
          f.size * 0.8,
          0
        );
        ctx.bezierCurveTo(
          f.size * 0.3,
          -f.size * 0.25,
          -f.size * 0.5,
          -f.size * 0.4,
          -f.size * 0.8,
          0
        );
        ctx.fill();

        // Draw animated tail
        ctx.save();
        ctx.translate(f.size * 0.8, 0);
        const tailScale = 0.9 + 0.2 * Math.sin(f.theta || time * 5 + index);
        ctx.scale(tailScale, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          f.size * 0.15,
          f.size * 0.25,
          f.size * 0.5,
          f.size * 0.2
        );
        ctx.quadraticCurveTo(f.size * 0.3, f.size * 0.125, f.size * 0.25, 0);
        ctx.quadraticCurveTo(
          f.size * 0.3,
          -f.size * 0.125,
          f.size * 0.5,
          -f.size * 0.2
        );
        ctx.quadraticCurveTo(f.size * 0.15, -f.size * 0.25, 0, 0);
        ctx.fill();
        ctx.restore();

        // Draw animated fin
        ctx.save();
        ctx.translate(-f.size * 0.1, 0);
        const finAngle =
          Math.PI / 6 + (Math.PI / 20) * Math.sin(f.phi || time * 3 + index);
        ctx.rotate(finAngle);
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.125, 0);
        ctx.bezierCurveTo(
          -f.size * 0.25,
          -f.size * 0.25,
          -f.size * 0.25,
          -f.size * 0.75,
          0,
          -f.size
        );
        ctx.bezierCurveTo(
          f.size * 0.3,
          -f.size * 0.625,
          f.size * 0.2,
          -f.size * 0.25,
          0,
          0
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw eye
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(-f.size * 0.2, -f.size * 0.15, f.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(-f.size * 0.15, -f.size * 0.15, f.size * 0.04, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      f.bubbles.forEach((bubble) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.life / 60})`;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });

    setFishFn(updatedFish);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative" style={{overflow: "hidden"}}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex-1 relative w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-b from-blue-300/50 to-blue-600/50"
            onDrop={handleCanvasDropReact}
            onDragOver={handleCanvasDragOverReact}
          />

          <div
            className={`absolute ${
              deviceType === "mobile" ? "right-2 top-20" : "right-4 top-20"
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
                      className={`rounded-full cursor-pointer hover:scale-110 transition-transform ${
                        deviceType === "mobile" ? "w-3 h-3" : "w-4 h-4"
                      } bg-yellow-400`}
                      draggable
                      onDragStart={handleFoodDragStart(foodItem)}
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
