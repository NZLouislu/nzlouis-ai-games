export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  jumping: boolean;
  facingLeft: boolean;
  animFrame: number;
  isMoving: boolean;
  isCat: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface LevelData {
  platforms: Platform[];
  catIcon?: Collectible;
}

export const GRAVITY = 0.6;
export const FRICTION = 0.8;
export const ACCELERATION = 0.8;
export const JUMP_FORCE = -12;
export const MAX_SPEED = 6;

export class GameEngine {
  player: Entity;
  currentScene: number = 1;
  levels: { [key: number]: LevelData };

  constructor() {
    this.player = {
      x: 150,
      y: 100,
      vx: 0,
      vy: 0,
      width: 40, // Uniform hitbox
      height: 40,
      grounded: false,
      jumping: false,
      facingLeft: false,
      animFrame: 0,
      isMoving: false,
      isCat: false, // Starts as Box
    };
    
    this.levels = {
      1: {
        platforms: [
          { x: 0, y: 350, width: 800, height: 100, color: "#9d50f0" },
          { x: 0, y: 0, width: 90, height: 350, color: "#9d50f0" },
          { x: 400, y: 220, width: 80, height: 50, color: "#9d50f0" },
          { x: 550, y: 280, width: 250, height: 120, color: "#60a5fa" },
          { x: 600, y: 220, width: 200, height: 180, color: "#3b82f6" },
          { x: 650, y: 160, width: 150, height: 240, color: "#2563eb" },
        ],
        catIcon: { x: 420, y: 170, width: 40, height: 40, collected: false }
      },
      2: {
        platforms: [
          { x: 0, y: 350, width: 800, height: 100, color: "#9d50f0" },
          { x: 710, y: 0, width: 90, height: 350, color: "#9d50f0" },
          { x: 200, y: 250, width: 100, height: 20, color: "#9d50f0" },
          { x: 200, y: 150, width: 300, height: 20, color: "#10b981" },
        ]
      }
    };
  }

  update(keys: { [key: string]: boolean }) {
    this.player.isMoving = false;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      if (this.player.vx > -MAX_SPEED) this.player.vx -= ACCELERATION;
      this.player.facingLeft = true;
      this.player.isMoving = true;
    } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      if (this.player.vx < MAX_SPEED) this.player.vx += ACCELERATION;
      this.player.facingLeft = false;
      this.player.isMoving = true;
    } else {
      this.player.vx *= FRICTION;
    }

    if (this.player.isMoving) {
      this.player.animFrame = (this.player.animFrame + 0.2) % (Math.PI * 2);
    } else {
      this.player.animFrame = 0;
    }

    if ((keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "]) && this.player.grounded && !this.player.jumping) {
      this.player.vy = JUMP_FORCE;
      this.player.grounded = false;
      this.player.jumping = true;
    }

    this.player.vy += GRAVITY;
    
    this.player.x += this.player.vx;
    this.checkHorizontalCollisions();
    
    this.player.y += this.player.vy;
    this.checkVerticalCollisions();

    // Cat Icon Collection Logic
    const level = this.levels[this.currentScene];
    if (level.catIcon && !level.catIcon.collected) {
      if (this.rectIntersect(this.player, level.catIcon)) {
        level.catIcon.collected = true;
        this.player.isCat = true;
      }
    }

    if (this.player.x > 800) {
      this.currentScene = 2;
      this.player.x = 10;
    } else if (this.player.x < -this.player.width) {
      this.currentScene = 1;
      this.player.x = 790 - this.player.width;
    }

    if (this.player.y > 600) {
        this.player.x = 150;
        this.player.y = 100;
        this.player.vx = 0;
        this.player.vy = 0;
    }
  }

  private rectIntersect(r1: any, r2: any) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  private checkHorizontalCollisions() {
    for (const p of this.levels[this.currentScene].platforms) {
      if (this.rectIntersect(this.player, p)) {
        if (this.player.vx > 0) {
          this.player.x = p.x - this.player.width;
          this.player.vx = 0;
        } else if (this.player.vx < 0) {
          this.player.x = p.x + p.width;
          this.player.vx = 0;
        }
      }
    }
  }

  private checkVerticalCollisions() {
    this.player.grounded = false;
    for (const p of this.levels[this.currentScene].platforms) {
      if (this.rectIntersect(this.player, p)) {
        if (this.player.vy > 0) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.grounded = true;
          this.player.jumping = false;
        } else if (this.player.vy < 0) {
          this.player.y = p.y + p.height;
          this.player.vy = 0;
        }
      }
    }
  }
}
