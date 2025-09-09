"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Fish } from "lucide-react";

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  bubbles: { x: number; y: number; life: number }[];
  image?: string;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [showAddFish, setShowAddFish] = useState(false);
  const [customFish, setCustomFish] = useState<Fish[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [food, setFood] = useState<Food[]>([]);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [fish, setFish] = useState<Fish[]>([
    { x: 100, y: 200, vx: 1, vy: 0.5, size: 30, color: "#FF6B6B", bubbles: [] },
    { x: 300, y: 150, vx: -1.2, vy: 0.3, size: 25, color: "#4ECDC4", bubbles: [] },
    { x: 500, y: 250, vx: 0.8, vy: -0.4, size: 35, color: "#45B7D1", bubbles: [] },
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
      const newFish: Fish = {
        x: Math.random() * 600 + 100,
        y: Math.random() * 200 + 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 30,
        color: "#FFD700",
        bubbles: [],
        image: uploadedImage,
      };
      setCustomFish(prev => [...prev, newFish]);
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
    setFood(prev => [...prev, newFood]);
  };

  const handleFoodDragStart = (foodItem: Food) => (event: React.DragEvent) => {
    setDraggedFood(foodItem);
    setIsDragging(true);
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (draggedFood) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        createFood(x, y);
        setFood(prev => prev.filter(f => f.id !== draggedFood.id));
      }
    }
    setDraggedFood(null);
    setIsDragging(false);
  };

  const handleCanvasDragOver = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

      const turtleDistance = Math.sqrt((x - turtle.x - 20) ** 2 + (y - turtle.y - 12) ** 2);
      if (turtleDistance < 30) {
        setClickedCreature("turtle");
        turtle.vx *= -1;
        setTimeout(() => setClickedCreature(null), 500);
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("drop", handleCanvasDrop);
    canvas.addEventListener("dragover", handleCanvasDragOver);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawSeaEnvironment(ctx, canvas.width, canvas.height);
      drawSeaweed(ctx, seaweed);
      drawCorals(ctx, corals);
      drawTurtle(ctx, turtle, clickedCreature === "turtle");
      updateAndDrawFish(ctx, [...fish, ...customFish], setFish, clickedCreature);
      drawFood(ctx, food, setFood, [...fish, ...customFish]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("drop", handleCanvasDrop);
      canvas.removeEventListener("dragover", handleCanvasDragOver);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fish, seaweed, corals, turtle]);

  const drawSeaEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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

  const drawSeaweed = (ctx: CanvasRenderingContext2D, seaweed: Seaweed[]) => {
    seaweed.forEach((weed, index) => {
      weed.sway += 0.02;
      const swayOffset = Math.sin(weed.sway + index) * 5;
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
        ctx.ellipse(weed.x + swayOffset + leafWave, leafY, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const drawCorals = (ctx: CanvasRenderingContext2D, corals: Coral[]) => {
    corals.forEach((coral) => {
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
    });
  };

  const drawTurtle = (ctx: CanvasRenderingContext2D, turtle: Turtle, isClicked: boolean = false) => {
    turtle.x += turtle.vx;
    if (turtle.x > 800) turtle.x = -50;

    ctx.save();
    if (isClicked) {
      ctx.scale(1.2, 1.2);
      ctx.translate(-turtle.x * 0.1, -turtle.y * 0.1);
    }

    ctx.fillStyle = "#8B4513";
    ctx.fillRect(turtle.x, turtle.y, 40, 25);

    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(turtle.x + 10, turtle.y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(turtle.x + 8, turtle.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawFood = (ctx: CanvasRenderingContext2D, food: Food[], setFood: React.Dispatch<React.SetStateAction<Food[]>>, allFish: Fish[]) => {
    const updatedFood = food.map(f => {
      if (f.eaten) return f;

      allFish.forEach(fish => {
        const distance = Math.sqrt((f.x - fish.x) ** 2 + (f.y - fish.y) ** 2);
        if (distance < fish.size) {
          f.eaten = true;
          fish.bubbles.push({ x: fish.x, y: fish.y, life: 30 });
        }
      });

      return f;
    }).filter(f => !f.eaten || f.eaten);

    updatedFood.forEach(f => {
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

    setFood(updatedFood.filter(f => !f.eaten));
  };

  const updateAndDrawFish = (ctx: CanvasRenderingContext2D, fish: Fish[], setFish: React.Dispatch<React.SetStateAction<Fish[]>>, clickedCreature: string | null = null) => {
    const updatedFish = fish.map((f) => {
      f.x += f.vx;
      f.y += f.vy;

      if (f.x < 0 || f.x > 800) f.vx *= -1;
      if (f.y < 50 || f.y > 350) f.vy *= -1;

      if (Math.random() < 0.01) {
        f.bubbles.push({ x: f.x, y: f.y, life: 60 });
      }

      f.bubbles = f.bubbles.filter((bubble) => {
        bubble.y -= 1;
        bubble.life -= 1;
        return bubble.life > 0;
      });

      return f;
    });

    updatedFish.forEach((f, index) => {
      const isClicked = clickedCreature === `fish-${index}`;

      ctx.save();
      if (isClicked) {
        ctx.scale(1.3, 1.3);
        ctx.translate(-f.x * 0.15, -f.y * 0.15);
      }

      if (f.image) {
        const img = new Image();
        img.src = f.image;
        if (img.complete) {
          ctx.save();
          if (f.vx < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -f.x - f.size, f.y - f.size / 2, f.size * 2, f.size);
          } else {
            ctx.drawImage(img, f.x - f.size, f.y - f.size / 2, f.size * 2, f.size);
          }
          ctx.restore();
        }
      } else {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.size, f.size / 2, f.vx > 0 ? 0 : Math.PI, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(f.x - f.size / 3, f.y - f.size / 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(f.x - f.size / 3, f.y - f.size / 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (f.vx > 0) {
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.moveTo(f.x + f.size, f.y);
          ctx.lineTo(f.x + f.size + 10, f.y - 5);
          ctx.lineTo(f.x + f.size + 10, f.y + 5);
          ctx.closePath();
          ctx.fill();
        }
      }

      f.bubbles.forEach((bubble) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.life / 60})`;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });

    setFish(updatedFish);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-30"></div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">AI Fish Aquarium</h1>
            <button
              onClick={() => setShowAddFish(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={20} />
              Add Fish
            </button>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-[60vh] sm:h-[70vh] bg-gradient-to-b from-blue-300/50 to-blue-600/50 rounded-2xl shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300"
              style={{ maxHeight: "600px", minHeight: "400px" }}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            />

            <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg">
              <div className="text-white text-xs sm:text-sm font-medium mb-2">Fish Food</div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => {
                  const foodItem: Food = {
                    x: 0,
                    y: 0,
                    id: `food-${i}`,
                    eaten: false,
                  };
                  return (
                    <div
                      key={i}
                      className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full cursor-pointer hover:scale-110 transition-transform"
                      draggable
                      onDragStart={handleFoodDragStart(foodItem)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddFish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Add Your Fish</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Fish Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {uploadedImage && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={uploadedImage}
                    alt="Fish preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto border-2 border-blue-200"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowAddFish(false);
                    setUploadedImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomFish}
                  disabled={!uploadedImage}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
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