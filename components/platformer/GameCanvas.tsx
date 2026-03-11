"use client";
import { useEffect, useRef } from "react";
import { GameEngine } from "./GameEngine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new GameEngine());
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const drawCat = (x: number, y: number, width: number, height: number, facingLeft: boolean, animFrame: number, color: string = "#fb923c") => {
      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      if (facingLeft) ctx.scale(-1, 1);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-10, -8); ctx.lineTo(-15, -18); ctx.lineTo(-5, -12); ctx.fill();
      ctx.moveTo(10, -8); ctx.lineTo(15, -18); ctx.lineTo(5, -12); ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(12, 5); ctx.quadraticCurveTo(25, 0, 20, -15); ctx.stroke();

      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(-4, -2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath(); ctx.arc(-3, -2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5, -2, 1.5, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      const legMove = Math.sin(animFrame) * 8;
      ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(-5 + legMove, 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, 8); ctx.lineTo(5 - legMove, 18); ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      engineRef.current.update(keysRef.current);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentLevel = engineRef.current.levels[engineRef.current.currentScene];
      for (const p of currentLevel.platforms) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      // Draw Cat Icon (Collectible)
      if (currentLevel.catIcon && !currentLevel.catIcon.collected) {
        const icon = currentLevel.catIcon;
        ctx.save();
        ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 200) * 0.2;
        drawCat(icon.x, icon.y, icon.width, icon.height, false, Date.now() / 100, "#9d50f0");
        ctx.restore();
        
        ctx.fillStyle = "#9d50f0";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Transformation!", icon.x + icon.width/2, icon.y - 10);
        ctx.textAlign = "left";
      }

      // SCENE # Indicator UI
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      const uiX = 20, uiY = 20, uiW = 180, uiH = 50;
      ctx.beginPath();
      ctx.roundRect(uiX, uiY, uiW, uiH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#475569";
      ctx.font = "bold 18px Helvetica, Arial";
      ctx.fillText("SCENE #", uiX + 15, uiY + 32);

      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.roundRect(uiX + 105, uiY + 10, 65, 30, 15);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(engineRef.current.currentScene.toString(), uiX + 137, uiY + 32);
      ctx.textAlign = "left";

      const p = engineRef.current.player;
      
      if (p.isCat) {
        drawCat(p.x, p.y, p.width, p.height, p.facingLeft, p.animFrame);
      } else {
        // Draw Box (Part 1 Style)
        ctx.fillStyle = "black";
        ctx.fillRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4);
        ctx.fillStyle = "#9d50f0";
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "white";
        const eyeSize = 10;
        const pupilSize = 4;
        const eye1X = p.x + (p.facingLeft ? 4 : 10);
        const eye2X = p.x + (p.facingLeft ? 16 : 22);
        const eyeY = p.y + 10;
        ctx.fillRect(eye1X, eyeY, eyeSize, eyeSize);
        ctx.fillRect(eye2X, eyeY, eyeSize, eyeSize);
        ctx.fillStyle = "black";
        ctx.fillRect(eye1X + 3, eyeY + 3, pupilSize, pupilSize);
        ctx.fillRect(eye2X + 3, eyeY + 3, pupilSize, pupilSize);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="rounded-xl shadow-inner cursor-none"
      />
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        WASD / Arrows to Move
      </div>
    </div>
  );
}
