"use client";

import React, { useEffect, useRef } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stage = { w: 1280, h: 720 };
    canvas.width = stage.w;
    canvas.height = stage.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const _ctx = ctx!;
    const _canvas = canvas!;

    let scale = 1;
    let portrait = true;
    let loffset = 0;
    let toffset = 0;

    const pointer = { x: 0, y: 0 };
    let mxpos = 0;
    let mypos = 0;

    function drawArrow(fromx: number, fromy: number, tox: number, toy: number, lw: number, hlen: number, color: string) {
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      _ctx.fillStyle = color;
      _ctx.strokeStyle = color;
      _ctx.lineCap = "round";
      _ctx.lineWidth = lw;
      _ctx.beginPath();
      _ctx.moveTo(fromx, fromy);
      _ctx.lineTo(tox, toy);
      _ctx.stroke();
      _ctx.beginPath();
      _ctx.moveTo(tox, toy);
      _ctx.lineTo(tox - hlen * Math.cos(angle - Math.PI / 6), toy - hlen * Math.sin(angle - Math.PI / 6));
      _ctx.lineTo(tox - (hlen * Math.cos(angle)) / 2, toy - (hlen * Math.sin(angle)) / 2);
      _ctx.lineTo(tox - hlen * Math.cos(angle + Math.PI / 6), toy - hlen * Math.sin(angle + Math.PI / 6));
      _ctx.closePath();
      _ctx.stroke();
      _ctx.fill();
    }

    const colors = [
      "#1abc9c","#1abc9c","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9",
      "#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#95a5a6","#f39c12","#d35400",
      "#c0392b","#bdc3c7","#7f8c8d"
    ];

    _ctx.clearRect(0, 0, stage.w, stage.h);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * 250 + 50;
      const myx = 360 + Math.sin(angle) * length;
      const myy = 360 - Math.cos(angle) * length;
      drawArrow(myx, myy, myx + (length / 6) * Math.sin(angle), myy - (length / 6) * Math.cos(angle), length / 30, length / 30, "#c0392b");
    }
    const explode = new Image();
    explode.src = _canvas.toDataURL("image/png");

    _ctx.clearRect(0, 0, stage.w, stage.h);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI - Math.PI / 2;
      const length = Math.random() * 480 + 50;
      const myx = stage.w / 2 + Math.sin(angle) * length;
      const myy = stage.h - Math.cos(angle) * length;
      drawArrow(myx, myy, myx + (length / 6) * Math.sin(angle), myy - (length / 6) * Math.cos(angle), length / 30, length / 30, "#2c3e50");
    }
    const explodeb = new Image();
    explodeb.src = _canvas.toDataURL("image/png");

    _ctx.clearRect(0, 0, stage.w, stage.h);
    _ctx.fillStyle = "rgba(236,240,241,1)";
    _ctx.fillRect(0, 0, stage.w, stage.h);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI / Math.PI * 180;
      const length = Math.random() * 250 + 50;
      const myx = Math.random() * stage.w;
      const myy = Math.random() * stage.h;
      drawArrow(myx, myy, myx + (length / 6) * Math.sin(angle), myy - (length / 6) * Math.cos(angle), length / 30, length / 30, colors[Math.floor(Math.random() * colors.length)]);
    }

    _ctx.fillStyle = "rgba(236,240,241,0.9)";
    _ctx.fillRect(0, 0, stage.w, stage.h);
    const back = new Image();
    back.src = canvas.toDataURL("image/png");

    let angle = 0;
    let ai = true;
    let ait = 0;
    let btm = 0;

    type BulletT = { x: number; y: number; r: number };
    const bullets: BulletT[] = [];
    function Bullet(): BulletT {
      return {
        x: stage.w / 2 - Math.sin(angle) * 150,
        y: stage.h - Math.cos(angle) * 150,
        r: angle,
      };
    }

    type EnemyT = { r: number; dis: number; x: number; y: number };
    const enemies: EnemyT[] = [];
    function Enemy(): EnemyT {
      const r = (Math.random() * Math.PI) / (2.5 / 2) - Math.PI / 2.5;
      const dis = Math.random() * 1280 + 720;
      const x = stage.w / 2 - Math.sin(r) * dis;
      const y = stage.h - Math.cos(r) * dis;
      return { r, dis, x, y };
    }
    for (let i = 0; i < 10; i++) {
      enemies.push(Enemy());
      enemies[i].x += Math.sin(enemies[i].r) * 300;
      enemies[i].y += Math.cos(enemies[i].r) * 300;
    }

    type ExplosionT = { x: number; y: number; t: number; ty: 1 | 2 };
    const explosions: ExplosionT[] = [];
    function Explosion(x: number, y: number, ty: 1 | 2): ExplosionT {
      return { x, y, t: 30, ty };
    }

    let eturn = 0;
    const cold: string[] = [];

    let shake = false;
    let shaket = 0;

    function enginestep() {
      _ctx.drawImage(back, 0, 0);

      if (!ai && ait < Date.now() - 3000) {
        ai = true;
      }
      btm++;
      if (btm > 8) {
        btm = 0;
        bullets.push(Bullet());
      }

      for (let i = 0; i < bullets.length; i++) {
        bullets[i].x -= Math.sin(bullets[i].r) * 20;
        bullets[i].y -= Math.cos(bullets[i].r) * 20;
        drawArrow(
          bullets[i].x + Math.sin(bullets[i].r) * 50,
          bullets[i].y + Math.cos(bullets[i].r) * 50,
          bullets[i].x,
          bullets[i].y,
          8,
          8,
          "#2980b9"
        );
        if (bullets[i].x < -100 || bullets[i].x > stage.w + 100) {
          bullets.splice(i, 1);
          i--;
          continue;
        }
        if (bullets[i].y < -100 || bullets[i].y > stage.h + 100) {
          bullets.splice(i, 1);
          i--;
          continue;
        }
      }

      for (let i = 0; i < enemies.length; i++) {
        enemies[i].x += Math.sin(enemies[i].r) * 3;
        enemies[i].y += Math.cos(enemies[i].r) * 3;
        drawArrow(
          enemies[i].x - Math.sin(enemies[i].r) * 100,
          enemies[i].y - Math.cos(enemies[i].r) * 100,
          enemies[i].x,
          enemies[i].y,
          15,
          15,
          "#c0392b"
        );
        if (enemies[i].y > stage.h) {
          enemies[i] = Enemy();
          explosions.push(Explosion(stage.w / 2, stage.h, 2));
          shake = true;
          shaket = 0;
        }
        for (let b = 0; b < bullets.length; b++) {
          const dx = enemies[i].x - bullets[b].x;
          const dy = enemies[i].y - bullets[b].y;
          const dis = dx * dx + dy * dy;
          if (dis < 20 * 20) {
            explosions.push(Explosion(enemies[i].x, enemies[i].y, 1));
            enemies[i] = Enemy();
            bullets.splice(b, 1);
            b--;
          }
        }
      }

      if (ai) {
        for (let l = 0; l < enemies.length; l++) {
          const dx = enemies[l].x - stage.w / 2;
          const dy = enemies[l].y - stage.h;
          const dis = Math.floor(Math.sqrt(dx * dx + dy * dy));
          const val1 = 100000 + dis;
          const val2 = 1000 + l;
          cold[l] = val1 + "x" + val2;
        }
        cold.sort();
        eturn = parseInt(cold[0].slice(8, 11));
        if (parseInt(cold[0].slice(1, 6)) < 800) {
          angle += (enemies[eturn].r - angle) / 8;
        }
      } else {
        const dx = pointer.x - stage.w / 2;
        const dy = pointer.y - stage.h;
        angle = Math.atan(dx / dy);
      }

      drawArrow(stage.w / 2, stage.h, stage.w / 2 - Math.sin(angle) * 150, stage.h - Math.cos(angle) * 150, 30, 20, "#2c3e50");

      for (let e = 0; e < explosions.length; e++) {
        if (explosions[e].ty === 1) {
          const myimg = explode;
          _ctx.globalAlpha = 1 - explosions[e].t / stage.h;
          _ctx.drawImage(
            myimg,
            explosions[e].x - explosions[e].t / 2,
            explosions[e].y - explosions[e].t / 2,
            (explosions[e].t * stage.w) / stage.h,
            explosions[e].t
          );
          _ctx.globalAlpha = 1;
        } else {
          const myimg = explodeb;
          _ctx.globalAlpha = 1 - explosions[e].t / stage.h;
          _ctx.drawImage(
            myimg,
            explosions[e].x - ((explosions[e].t * stage.w) / stage.h) / 2,
            stage.h - explosions[e].t,
            (explosions[e].t * stage.w) / stage.h,
            explosions[e].t
          );
          _ctx.globalAlpha = 1;
        }
      }

      for (let e = 0; e < explosions.length; e++) {
        explosions[e].t += 20;
        if (explosions[e].t > stage.h) {
          explosions.splice(e, 1);
          e--;
        }
      }
    }

    function _pexresize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleW = vw / stage.w;
      const scaleH = vh / stage.h;
      const base = Math.min(scaleW, scaleH);
      const cw = Math.round(stage.w * base);
      const ch = Math.round(stage.h * base);

      portrait = cw <= ch * (stage.w / stage.h);
      scale = stage.w / cw;

      loffset = (vw - cw) / 2;
      toffset = (vh - ch) / 2;

      _canvas.width = cw;
      _canvas.height = ch;

      _canvas.style.width = cw + "px";
      _canvas.style.height = ch + "px";
      _canvas.style.marginLeft = "0px";
      _canvas.style.marginTop = "0px";
    }

    function motchstart(e: MouseEvent | Touch) {
      mxpos = ((e as MouseEvent).pageX - loffset) * scale;
      mypos = ((e as MouseEvent).pageY - toffset) * scale;
    }

    function motchmove(e: MouseEvent | Touch) {
      mxpos = ((e as MouseEvent).pageX - loffset) * scale;
      mypos = ((e as MouseEvent).pageY - toffset) * scale;
      pointer.x = mxpos;
      pointer.y = mypos;
      ai = false;
      ait = Date.now();
    }

    function motchend() {}

    const onMouseDown = (e: MouseEvent) => motchstart(e);
    const onMouseMove = (e: MouseEvent) => motchmove(e);
    const onMouseUp = () => motchend();
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) motchstart(e.touches[0]);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) motchmove(e.touches[0]);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      motchend();
    };

    const animated = () => {
      rafRef.current = window.requestAnimationFrame(animated);
      let trax = 0, tray = 0;
      if (shake) {
        trax = Math.random() * 60 - 30;
        tray = Math.random() * 60 - 30;
        _ctx.translate(trax, tray);
      }
      enginestep();
      if (shake) {
        _ctx.translate(-trax, -tray);
        shaket++;
        if (shaket > 20) {
          shaket = 0;
          shake = false;
        }
      }
    };

    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("resize", _pexresize);

    _pexresize();
    animated();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd as EventListener);
      window.removeEventListener("resize", _pexresize);
    };
  }, []);

  return (
    <main className="h-full bg-black overflow-hidden pt-16">
      <div className="relative w-full h-[calc(100%-4rem)]">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ecf0f1] block"
        />
      </div>
    </main>
  );
}