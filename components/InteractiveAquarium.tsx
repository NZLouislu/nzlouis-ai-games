import React, { useState, useEffect, useRef, useCallback } from "react";

const FishSvg = ({ color = "#ff8c00", className = "", direction = 1 }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" }}
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <path
        fill={color}
        d="M89.2,33.7c-3.3-11.5-12.9-20.3-24.8-23.2c-1-0.2-2-0.4-3-0.5c-2.4-0.3-4.9-0.2-7.3,0.3 c-7.3,1.4-13.9,5.5-18.3,11.3C31.2,27.8,27,34.4,25.4,41.8c-1.2,5.6-0.8,11.4,1.1,16.8c1.2,3.4,3.1,6.5,5.4,9.2 c2.1,2.4,4.5,4.5,7.2,6.1c-2.1,2.1-4.1,4.4-5.8,6.8c-0.8,1.1-1.5,2.3-2.2,3.4c-0.3,0.5-0.5,1-0.8,1.5c-0.1,0.2-0.1,0.3-0.2,0.5 c-0.4,0.6-0.8,1.2-1.2,1.8c-0.1,0.2-0.2,0.3-0.3,0.5c-0.1,0.1-0.2,0.3-0.2,0.4c-0.1,0.2-0.2,0.3-0.3,0.5 c-0.6,1.1-1.2,2.2-1.7,3.3c-0.1,0.2-0.2,0.4-0.2,0.6c-0.1,0.2-0.2,0.5-0.3,0.7c-0.1,0.3-0.1,0.5-0.2,0.8c-0.1,0.4-0.2,0.8-0.2,1.2 c-0.1,0.6-0.1,1.2,0,1.8c0.1,0.4,0.2,0.8,0.4,1.2c0.2,0.5,0.5,1,0.8,1.4c0.5,0.8,1.1,1.5,1.8,2.1c1,0.8,2.1,1.5,3.2,2 c0.2,0.1,0.4,0.2,0.6,0.2c0.1,0,0.1,0,0.2,0.1c1.3,0.5,2.7,0.8,4.1,0.9c0.4,0,0.8,0.1,1.2,0.1c2.1,0,4.2-0.4,6.2-1.2 c2.3-1,4.3-2.4,6-4.3c1.1-1.2,2-2.5,2.9-3.9c0.5-0.8,1-1.6,1.4-2.5c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.2,0.2-0.5,0.3-0.7 c0.1-0.3,0.2-0.6,0.3-1c0.1-0.4,0.1-0.8,0.1-1.2c0-0.4-0.1-0.9-0.2-1.3c-0.1-0.5-0.3-1-0.5-1.5c-0.3-0.8-0.7-1.5-1.1-2.2 c-0.1-0.2-0.2-0.3-0.3-0.5c-0.1-0.1-0.1-0.2-0.2-0.3c-0.6-1-1.2-2-1.9-2.9c-1.4-1.9-3-3.6-4.8-5.1c4.9-0.4,9.6-2.6,13.2-6.2 c4.1-4.1,6.7-9.4,7.1-15.2C90.1,40.4,89.9,37,89.2,33.7z"
      />
      {/* 眼睛位置根据方向调整，使其与鱼鳍在同一侧 */}
      <circle fill="#fff" cx="70.5" cy={direction > 0 ? "35.5" : "45.5"} r="5.5" />
      <circle fill="#333" cx="71.5" cy={direction > 0 ? "35.5" : "45.5"} r="2.5" />
    </g>
  </svg>
);

interface SwimmingItemType {
  id: string | number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  src?: string;
  type?: string;
  color?: string;
  direction: number;
}

const SwimmingItem = ({ item, onClick }: { item: SwimmingItemType; onClick: (id: string | number) => void }) => {
  const { x, y, size, src, type, color, direction } = item;

  return (
    <div
      className="absolute cursor-pointer transition-transform duration-500 ease-in-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `scaleX(${direction})`,
        willChange: "left, top",
      }}
      onClick={() => onClick(item.id)}
    >
      {type === "fish" ? (
        <FishSvg color={color} className="w-full h-full" direction={direction} />
      ) : (
        <img
          src={src}
          alt="swimming item"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      )}
    </div>
  );
};

export default function InteractiveAquarium() {
  const [items, setItems] = useState<SwimmingItemType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createItem = useCallback((config: Partial<SwimmingItemType>) => {
    const container = containerRef.current;
    const size = Math.random() * 80 + 50;
    const x =
      Math.random() * ((container?.clientWidth || window.innerWidth) - size);
    const y =
      Math.random() * ((container?.clientHeight || window.innerHeight) - size);
    const speedX = (Math.random() - 0.5) * 2;
    const speedY = (Math.random() - 0.5) * 1;

    return {
      id: Date.now() + Math.random(),
      size,
      x,
      y,
      speedX,
      speedY,
      direction: speedX > 0 ? 1 : -1,
      ...config,
    };
  }, []);

  useEffect(() => {
    const initialFish = [
      { color: "#ff8c00" },
      { color: "#4169e1" },
      { color: "#f0e68c" },
    ];
    const newItems = initialFish.map((fish) =>
      createItem({
        type: "fish",
        color: fish.color,
      })
    );
    setItems(newItems);
  }, [createItem]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setItems((prevItems) => {
        const container = containerRef.current;
        if (!container) return prevItems;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        return prevItems.map((item) => {
          let { x, y, speedX, speedY, direction } = item;
          const { size } = item;

          x += speedX;
          y += speedY;

          if (x <= 0 || x >= containerWidth - size) {
            speedX *= -1;
          }
          if (y <= 0 || y >= containerHeight - size) {
            speedY *= -1;
          }

          x = Math.max(0, Math.min(x, containerWidth - size));
          y = Math.max(0, Math.min(y, containerHeight - size));

          direction = speedX > 0 ? 1 : -1;

          return { ...item, x, y, speedX, speedY, direction };
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClick = useCallback((id: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            speedX: -item.speedX * 2,
            speedY: (Math.random() - 0.5) * 4,
          };
        }
        return item;
      })
    );

    setTimeout(() => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            if (typeof item.speedX === "number") {
              return {
                ...item,
                speedX: item.speedX / 2,
              };
            }
          }
          return item;
        })
      );
    }, 500);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newItem = createItem({
          type: "image",
          src: e.target?.result as string,
        });
        setItems((prevItems) => [...prevItems, newItem]);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="w-full h-screen font-sans bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="absolute top-5 text-center z-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-shadow">
          Interactive Aquarium
        </h1>
        <p className="text-lg text-gray-300 text-shadow">
          Click a fish or an image to see what happens!
        </p>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full max-w-7xl max-h-[80vh] bg-gradient-to-b from-blue-500 to-blue-800 rounded-2xl shadow-2xl overflow-hidden relative border-4 border-white/50"
      >
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>

        {items.map((item) => (
          <SwimmingItem key={item.id} item={item} onClick={handleClick} />
        ))}
      </div>

      <div className="mt-6 z-20">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <button
          onClick={triggerFileSelect}
          className="px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
        >
          Add Your Own Image
        </button>
      </div>
    </div>
  );
}
