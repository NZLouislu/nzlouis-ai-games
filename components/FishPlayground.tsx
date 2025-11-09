"use client";

import React, { useEffect, useRef, useState } from "react";

type FishImage = {
  id: string;
  img: HTMLImageElement;
  width: number;
  height: number;
  src: string;
};

type Fish = {
  id: string;
  imgIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  wiggle: number;
  flip: boolean;
  life: number;
  ttl: number;
  boostFrames?: number;
};

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function FishPlayground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const fishPoolRef = useRef<Fish[]>([]);
  const imagesRef = useRef<FishImage[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [spawnRate, setSpawnRate] = useState(0.8);
  const spawnTimerRef = useRef(0);
  const [userImagesCount, setUserImagesCount] = useState(0);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='48'><rect rx='10' width='100%' height='100%' fill='#0ea5a3'/><text x='50%' y='55%' font-family='sans-serif' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'>nzlouis</text></svg>`
    );
    setLogoDataUrl(`data:image/svg+xml;charset=utf-8,${svg}`);
  }, []);

  const loadImage = (src: string): Promise<FishImage> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        res({ id: uid("img_"), img, width: img.naturalWidth, height: img.naturalHeight, src });
      };
      img.onerror = (e) => rej(e);
      img.src = src;
    });

  useEffect(() => {
    let mounted = true;
    async function init() {
      imagesRef.current = [];
      if (logoDataUrl) {
        try {
          const li = await loadImage(logoDataUrl);
          if (!mounted) return;
          imagesRef.current.push(li);
        } catch (e) {
          console.warn("logo load failed", e);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [logoDataUrl]);

  const spawnFish = (count = 1) => {
    const imgs = imagesRef.current;
    if (imgs.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width / dpr : window.innerWidth;
    const h = canvas ? canvas.height / dpr : window.innerHeight;
    for (let i = 0; i < count; i++) {
      const startFromLeft = Math.random() > 0.5 ? 1 : -1;
      const x = startFromLeft === 1 ? -50 : w + 50;
      const y = h * (0.1 + Math.random() * 0.8);
      const imgIndex = Math.floor(Math.random() * imgs.length);
      const baseSize = 40 + Math.random() * 60;
      const speed = 20 + Math.random() * 80;
      const f: Fish = {
        id: uid("fish_"),
        imgIndex,
        x,
        y,
        vx: ((startFromLeft === 1 ? 1 : -1) * speed) / 60,
        vy: (Math.random() - 0.5) * 0.5,
        size: baseSize,
        speed,
        wiggle: Math.random() * 0.6 + 0.4,
        flip: startFromLeft !== 1,
        life: 0,
        ttl: 60 * (8 + Math.random() * 12),
      };
      fishPoolRef.current.push(f);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let mounted = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const step = (ts: number) => {
      if (!mounted) return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(50, ts - lastTsRef.current);
      lastTsRef.current = ts;

      spawnTimerRef.current += dt / 1000;
      const toSpawn = Math.floor(spawnTimerRef.current * spawnRate);
      if (toSpawn > 0) {
        spawnTimerRef.current -= toSpawn / spawnRate;
        spawnFish(toSpawn);
      }

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(250,250,255,0.02)");
      g.addColorStop(1, "rgba(240,247,255,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const fishList = fishPoolRef.current;
      for (let i = fishList.length - 1; i >= 0; i--) {
        const f = fishList[i];
        f.life += dt / (1000 / 60);

        const boostActive = (f.boostFrames && f.boostFrames > 0) || false;
        const boostMultiplier = boostActive ? 1.8 : 1;
        if (boostActive) f.boostFrames = Math.max(0, (f.boostFrames || 0) - 1);

        f.x += f.vx * boostMultiplier * (dt / (1000 / 60));
        f.y += Math.sin(f.life * 0.05 * f.wiggle) * (0.8 * f.wiggle);
        f.y += Math.sin((f.life + i) * 0.02) * 0.2;

        const imgObj = imagesRef.current[f.imgIndex];
        if (imgObj && imgObj.img.complete) {
          const angle = Math.atan2(f.vy, f.vx);
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(angle);
          const drawW = f.size;
          const drawH = (imgObj.height / imgObj.width) * f.size;
          const flipH = f.vx < 0 ? -1 : 1;
          ctx.scale(flipH, 1);
          ctx.globalAlpha = boostActive ? 1 : 0.95;
          ctx.shadowColor = boostActive ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)";
          ctx.shadowBlur = boostActive ? 12 : 6;
          ctx.drawImage(imgObj.img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }

        if (f.x < -200 || f.x > w + 200 || f.y < -200 || f.y > h + 200 || f.life > f.ttl) {
          fishList.splice(i, 1);
        }
      }

      if (isRunning) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, spawnRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const fishList = fishPoolRef.current;
      for (let i = 0; i < fishList.length; i++) {
        const f = fishList[i];
        const dx = f.x - x;
        const dy = f.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < f.size * 0.8) {
          const awayX = dx / (dist || 1);
          const awayY = dy / (dist || 1);
          const boostSpeed = f.speed * 2;
          f.vx = awayX * (boostSpeed / 60);
          f.vy = awayY * (boostSpeed * 0.6 / 60);
          f.wiggle = 3 + Math.random() * 2;
          f.boostFrames = 60;
          f.ttl = Math.min(f.ttl, f.life + 120);
        }
      }
    };
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const addImageSrcToPool = async (src: string) => {
    try {
      const fi = await loadImage(src);
      imagesRef.current.push(fi);
      setUserImagesCount((n) => n + 1);
    } catch (e) {
      console.warn("image load failed", e);
    }
  };

  function SignaturePad() {
    const padRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);

    useEffect(() => {
      const canvas = padRef.current!;
      const ctx = canvas.getContext("2d")!;
      const resizePad = () => {
        const DPR = window.devicePixelRatio || 1;
        const w = Math.min(800, Math.max(300, window.innerWidth * 0.45));
        const h = 160;
        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0f172a";
        ctx.clearRect(0, 0, w, h);
      };
      resizePad();
      window.addEventListener("resize", resizePad);
      return () => window.removeEventListener("resize", resizePad);
    }, []);

    const toDataUrl = () => {
      const canvas = padRef.current!;
      const url = canvas.toDataURL("image/png");
      return url;
    };

    const clear = () => {
      const canvas = padRef.current!;
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
    };

    useEffect(() => {
      const canvas = padRef.current!;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      let lastX = 0,
        lastY = 0;
      const onDown = (e: PointerEvent) => {
        drawing.current = true;
        canvas.setPointerCapture(e.pointerId);
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
      };
      const onMove = (e: PointerEvent) => {
        if (!drawing.current) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
      };
      const onUp = (e: PointerEvent) => {
        drawing.current = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
      };
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return () => {
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, []);

    return (
      <div className="p-3 bg-white rounded-md shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <strong className="text-sm">Draw a signature</strong>
          <div className="text-xs text-muted-foreground"></div>
        </div>
        <canvas ref={padRef} className="w-full rounded border border-gray-200" />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => clear()}>
            Clear
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              const url = toDataUrl();
              addImageSrcToPool(url);
            }}
          >
            Add as fish
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => {
              spawnFish(3);
            }}
          >
            Spawn 3 fish
          </button>
        </div>
      </div>
    );
  }

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      addImageSrcToPool(src);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto" }}
      />
      <div style={{ position: "relative", zIndex: 5 }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-white rounded shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Fish Playground</h2>
                <p className="text-sm text-gray-600">
                  The background has fish made from images or signatures you add. Click a fish to scare it away.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex items-center gap-2 bg-white rounded px-3 py-1 border">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload(f);
                        e.currentTarget.value = "";
                      }}
                    />
                    <span className="text-sm text-gray-700">Upload image</span>
                  </label>
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => {
                      if (logoDataUrl) addImageSrcToPool(logoDataUrl);
                    }}
                  >
                    Add default logo
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <label className="text-sm">Spawn rate</label>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.1}
                      value={spawnRate}
                      onChange={(e) => setSpawnRate(Number(e.target.value))}
                    />
                    <span className="text-sm w-10">{spawnRate.toFixed(1)}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() => setIsRunning((r) => !r)}
                    >
                      {isRunning ? "Pause" : "Run"}
                    </button>
                  </div>
                </div>
              </div>

              <SignaturePad />

              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="font-medium mb-2">Pool info</h3>
                <div className="text-sm text-gray-700">
                  <div>Images in pool: {imagesRef.current.length}</div>
                  <div>User images added: {userImagesCount}</div>
                  <div>Fish on screen: {fishPoolRef.current.length}</div>
                </div>
              </div>
            </div>

            <div style={{ width: 320 }} className="space-y-4">
              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="font-medium mb-2">Preview & Controls</h3>
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => spawnFish(5)}>
                    Spawn 5 fish
                  </button>
                  <button
                    className="px-3 py-2 bg-red-500 text-white rounded"
                    onClick={() => {
                      fishPoolRef.current = [];
                    }}
                  >
                    Clear fish
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="font-medium mb-2">Tips</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Upload a PNG/JPG or draw a signature and &quot;Add as fish&quot;.</li>
                  <li>Click a fish on screen to make it dash away.</li>
                  <li>For best visual, use transparent PNGs or SVGs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="w-full h-screen">
      <FishPlayground />
    </div>
  );
}
