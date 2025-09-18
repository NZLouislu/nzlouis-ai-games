'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './gacha-machine.css';

interface Prize {
  image: string;
  title: string;
}

interface Ball {
  dom: HTMLElement;
  x: number;
  y: number;
  rotate: number;
  size: number;
}

const GachaMachine: React.FC = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLImageElement>(null);
  const ballsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  
  const [balls, setBalls] = useState<Ball[]>([]);
  const [started, setStarted] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [prizeBall, setPrizeBall] = useState<Ball | null>(null);
  const jittersRef = useRef<gsap.core.Timeline[]>([]);

  const SPEED = 1;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const confetti = (parent: HTMLElement, options: {
    count?: number;
    x?: number;
    y?: number;
    randX?: number;
    randY?: number;
    speedX?: number;
    speedY?: number;
    speedRandX?: number;
    speedRandY?: number;
    gravity?: number;
    size?: number;
    sizeRand?: number;
  } = {}) => {
    const {
      count = 100,
      x = 50,
      y = 50,
      randX = 10,
      randY = 10,
      speedX = 0,
      speedY = -2,
      speedRandX = 0.5,
      speedRandY = 0.5,
      gravity = 0.01,
      size = 10,
      sizeRand = 5
    } = options;

    const container = document.createElement('div');
    container.classList.add('confetti');

    const particles: Array<{
      dom: HTMLElement;
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');

      const settings = {
        dom: particle,
        x: x + Math.random() * randX * 2 - randX,
        y: y + Math.random() * randY * 2 - randY,
        speedX: speedX + Math.random() * speedRandX * 2 - speedRandX,
        speedY: speedY + Math.random() * speedRandY * 2 - speedRandY,
        size: size + Math.random() * sizeRand * 2 - sizeRand
      };

      particle.style.backgroundColor = `hsl(${Math.random() * 360}deg, 80%, 60%)`;
      particle.style.setProperty('--rx', (Math.random() * 2 - 1).toString());
      particle.style.setProperty('--ry', (Math.random() * 2 - 1).toString());
      particle.style.setProperty('--rz', (Math.random() * 2 - 1).toString());
      particle.style.setProperty('--rs', (Math.random() * 2 + 0.5).toString());
      particles.push(settings);
      container.appendChild(particle);
    }

    const update = () => {
      particles.forEach((config, i) => {
        if (config.y > 100) {
          particles.splice(i, 1);
          config.dom.remove();
        }

        config.dom.style.setProperty('--size', config.size.toString());
        config.dom.style.left = config.x + '%';
        config.dom.style.top = config.y + '%';
        config.x += config.speedX;
        config.y += config.speedY;
        config.speedY += gravity;
      });

      if (particles.length) {
        requestAnimationFrame(update);
      } else {
        container.remove();
      }
    };

    update();
    parent.insertAdjacentElement('beforeend', container);
  };

  const getPrize = async (): Promise<Prize> => {
    const prizes = [
      {
        image: 'https://assets.codepen.io/2509128/prize1.png',
        title: 'Bunny'
      },
      {
        image: 'https://assets.codepen.io/2509128/prize2.png',
        title: 'Teddy Bear'
      },
      {
        image: 'https://assets.codepen.io/2509128/prize3.png',
        title: 'Polar Bear'
      },
      {
        image: 'https://assets.codepen.io/2509128/prize4.png',
        title: 'Polar Bear Bride'
      }
    ];

    return prizes[~~(prizes.length * Math.random())];
  };

  const createBalls = () => {
    if (!ballsRef.current) {
      console.log('ballsRef.current is null');
      return;
    }

    console.log('ballsRef.current found:', ballsRef.current);
    let id = 0;
    const newBalls: Ball[] = [];

    const createBall = (x: number, y: number, rotate = ~~(Math.random() * 360), hue = ~~(Math.random() * 360)): Ball => {
      const size = 8;
      const ball = document.createElement('figure');
      ball.classList.add('ball');
      ball.setAttribute('data-id', (++id).toString());
      ball.style.setProperty('--size', `${size}vh`);
      ball.style.setProperty('--color1', `hsl(${hue}deg, 80%, 70%)`);
      ball.style.setProperty('--color2', `hsl(${hue + 20}deg, 50%, 90%)`);
      ball.style.setProperty('--outline', `hsl(${hue}deg, 50%, 55%)`);
      
      console.log('Creating ball with styles:', {
        size: `${size}vh`,
        color1: `hsl(${hue}deg, 80%, 70%)`,
        color2: `hsl(${hue + 20}deg, 50%, 90%)`,
        outline: `hsl(${hue}deg, 50%, 55%)`
      });
      
      ballsRef.current!.appendChild(ball);
      console.log('Ball appended to DOM');

      const update = () => {
        gsap.set(ball, {
          css: {
            left: `calc(${x} * (100% - ${size}vh))`,
            top: `calc(${y} * (100% - ${size}vh))`,
            transform: `rotate(${rotate}deg)`
          },
        });
      };

      const ballObj: Ball = {
        dom: ball,
        get x() { return x; },
        get y() { return y; },
        get rotate() { return rotate; },
        set x(value) { x = value; update(); },
        set y(value) { y = value; update(); },
        set rotate(value) { rotate = value; update(); },
        get size() { return size; }
      };

      newBalls.push(ballObj);
      update();
      return ballObj;
    };

    createBall(0.5, 0.6);
    createBall(0, 0.68);
    createBall(0.22, 0.65);
    createBall(0.7, 0.63);
    createBall(0.96, 0.66);
    createBall(0.75, 0.79);
    createBall(0.5, 0.8);
    const newPrizeBall = createBall(0.9, 0.81);
    createBall(0, 0.82);
    createBall(1, 0.9);
    createBall(0.25, 0.85);
    createBall(0.9, 1);
    createBall(0.4, 1);
    createBall(0.65, 1);
    createBall(0.09, 1);

    setBalls(newBalls);
    setPrizeBall(newPrizeBall);
  };

  const jitter = () => {
    balls.forEach(({ dom, rotate }, i) => {
      const tl = gsap.timeline({ repeat: -1, delay: -i * 0.0613 });

      gsap.set(dom, {
        y: 0,
        rotateZ: rotate,
      });

      const duration = Math.random() * 0.1 + 0.05;

      tl.to(dom, {
        y: -(Math.random() * 6 + 2),
        rotateZ: rotate,
        duration,
        ease: 'power1.out'
      }).to(dom, {
        y: 0,
        rotateZ: rotate - Math.random() * 10 - 5,
        duration,
      });

      jittersRef.current.push(tl);
    });

    const tl = gsap.timeline({ repeat: -1 });
    tl.to('.machine-container', {
      x: 2,
      duration: 0.1
    }).to('.machine-container', {
      x: 0,
      duration: 0.1
    });

    jittersRef.current.push(tl);
  };

  const stopJittering = async () => {
    jittersRef.current.forEach(jitter => jitter.pause());

    balls.forEach(({ dom, rotate }) => {
      gsap.to(dom, {
        y: 0,
        rotate,
        duration: 0.1
      });
    });

    gsap.to('.machine-container', {
      x: 0,
      duration: 0.1
    });

    await delay(200);
  };

  const showHint = () => {
    if (!titleRef.current || !pointerRef.current) return;

    gsap.set(pointerRef.current, { opacity: 0 });
    
    gsap.to(titleRef.current, {
      y: '80vh',
      duration: 1,
      ease: 'back.out'
    });

    gsap.to(pointerRef.current, {
      opacity: 1,
      duration: 1,
      ease: 'none'
    });
  };

  const hideHint = () => {
    if (!titleRef.current || !pointerRef.current) return;

    gsap.to(titleRef.current, {
      y: '120vh',
      duration: 0.6
    });

    gsap.to(pointerRef.current, {
      opacity: 0,
      duration: 1
    });
  };

  const showHint2 = () => {
    if (!titleRef.current || !pointerRef.current) return;

    const titleElement = titleRef.current.children[0] as HTMLElement;
    if (titleElement) {
      titleElement.innerHTML = 'Tap to claim it!';
    }

    gsap.set(pointerRef.current, {
      x: '16vh',
      y: '3vh'
    });

    gsap.to(titleRef.current, {
      y: '80vh',
      duration: 1,
      ease: 'back.out'
    });

    gsap.to(pointerRef.current, {
      opacity: 1,
      duration: 1,
      ease: 'none'
    });
  };

  const pickup = () => {
    if (!prizeBall || !appRef.current) return;

    let { x, y } = prizeBall.dom.getBoundingClientRect();
    [x, y] = [x / window.innerHeight * 100, y / window.innerHeight * 100]; 
    
    const prizeBallContainer = document.querySelector('.prize-container .prize-ball-container') as HTMLElement;
    if (prizeBallContainer) {
      prizeBallContainer.appendChild(prizeBall.dom);
    }

    const rotate = prizeBall.rotate;
    prizeBall.x = 0;
    prizeBall.y = 0;
    prizeBall.rotate = 0;

    const gameLayer = document.querySelector('.game-layer') as HTMLElement;
    if (gameLayer) {
      gameLayer.classList.add('dim');
      gameLayer.setAttribute('data-animate', '');
    }

    prizeBall.dom.style.left = '0';
    prizeBall.dom.style.top = '0';

    gsap.set(prizeBall.dom, {
      x: `${x}vh`,
      y: `${y}vh`,
      rotate,
      duration: 1
    });

    gsap.to('.prize-container .prize-ball-container', {
      x: `-4vh`,
      y: `-4vh`,
      duration: 1
    });

    const tl = gsap.timeline();
    tl.to(prizeBall.dom, {
      x: '50vw',
      y: '50vh',
      scale: 2,
      rotate: -180,
      duration: 1
    }).to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 2.1,
      ease: 'power1.inOut',
      scaleY: 1.9
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.inOut',
      scaleX: 1.9,
      scaleY: 2.1
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.inOut',
      scaleX: 2.1,
      scaleY: 1.9
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.inOut',
      scaleX: 1.9,
      scaleY: 2.1
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.inOut',
      scaleX: 2.1,
      scaleY: 1.9
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.inOut',
      scaleX: 1.9,
      scaleY: 2.1
    }).to(prizeBall.dom, {
      duration: 0.5,
      ease: 'power1.out',
      scaleX: 2.6,
      scaleY: 1.6
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.out',
      scaleX: 1.6,
      scaleY: 2.4,
      onComplete: pop
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.out',
      scaleX: 2.1,
      scaleY: 1.9,
    }).to(prizeBall.dom, {
      duration: 0.1,
      ease: 'power1.out',
      scaleX: 2,
      scaleY: 2
    });
  };

  const pop = () => {
    if (!appRef.current || !prize || !titleRef.current || !machineRef.current) return;

    confetti(appRef.current, {
      speedRandY: 1,
      speedRandX: 0.75,
      speedY: -0.5,
      gravity: 0.02,
      y: 50,
      randX: 6,
      randY: 6,
      size: 8,
      sizeRand: 4,
      count: 128
    });
    
    gsap.set('.prize-reward-container .prize', {
      scale: 0
    });

    gsap.to('.prize-reward-container', {
      opacity: 1,
      duration: 0.3
    });

    gsap.to('.prize-reward-container .prize', {
      scale: 1,
      duration: 0.5,
      ease: 'back.out'
    });

    if (prizeBall) {
      gsap.to(prizeBall.dom, {
        opacity: 0
      });
    }

    gsap.set(titleRef.current, {
      y: '-50vh',
    });

    const titleElement = titleRef.current.children[0] as HTMLElement;
    if (titleElement) {
      titleElement.innerHTML = `You got a<br>${prize.title}`;
    }

    gsap.to(titleRef.current, {
      delay: 1,
      y: '5vh',
      duration: 0.6
    });

    gsap.to(machineRef.current, {
      y: '100vh',
      duration: 1,
      delay: 1,
      onComplete() {
        if (machineRef.current) {
          machineRef.current.remove();
        }
      }
    });
  };

  const start = async () => {
    if (!handleRef.current) return;

    handleRef.current.style.cursor = 'default';
    setStarted(true);
    hideHint();

    await new Promise<void>(resolve => {
      const tl = gsap.timeline();
      tl.to(handleRef.current, {
        rotate: 90,
        duration: 0.3,
        ease: 'power1.in',
        onComplete() {
          jitter();
          setTimeout(async () => {
            await delay(2000 * SPEED);
            await stopJittering();
            resolve();
          }, 0);
        }
      }).to(handleRef.current, {
        rotate: 0,
        duration: 1,
      });
    });

    if (!prizeBall) return;

    await new Promise<void>(resolve => {
      gsap.to(prizeBall.dom, {
        x: '-3vh',
        ease: 'none',
        duration: 0.5,
        rotate: prizeBall.rotate + 10
      });

      if (balls[3]) {
        gsap.to(balls[3].dom, {
          x: '1vh',
          y: '1vh',
          ease: 'none',
          duration: 0.5,
          rotate: balls[3].rotate - 5
        });
      }

      if (balls[4]) {
        gsap.to(balls[4].dom, {
          x: '-1vh',
          y: '1vh',
          ease: 'none',
          duration: 0.5,
          rotate: balls[4].rotate - 5
        });
      }

      if (balls[5]) {
        gsap.to(balls[5].dom, {
          x: '1vh',
          y: '1vh',
          ease: 'none',
          duration: 0.5,
          rotate: balls[5].rotate - 5
        });
      }

      const tl = gsap.timeline();
      tl.to(prizeBall.dom, {
        y: '12vh',
        ease: 'power1.in',
        duration: 0.5
      }).to(prizeBall.dom, {
        y: '23vh',
        ease: 'power1.in',
        duration: 0.5
      }).to(prizeBall.dom, {
        y: '22vh',
        ease: 'power1.out',
        duration: 0.2
      }).to(prizeBall.dom, {
        y: '23vh',
        ease: 'power1.in',
        duration: 0.2
      }).to(prizeBall.dom, {
        y: '22.5vh',
        ease: 'power1.out',
        duration: 0.1
      }).to(prizeBall.dom, {
        y: '23vh',
        ease: 'power1.in',
        duration: 0.1,
        onComplete: resolve
      });
    });
    
    prizeBall.dom.style.cursor = 'pointer';

    let shouldShowHint = true;
    prizeBall.dom.addEventListener('click', () => {
      prizeBall.dom.style.cursor = 'default';
      shouldShowHint = false;
      hideHint();
      pickup();
    }, { once: true });

    await delay(2000);
    if (shouldShowHint) {
      showHint2();
    }
  };

  const prepare = () => {
    if (!machineRef.current || !handleRef.current) return;

    const tl = gsap.timeline();

    tl.to(machineRef.current, {
      y: '0vh',
      ease: 'none',
      duration: 0.6,
      onComplete() {
        if (handleRef.current) {
          handleRef.current.style.cursor = 'pointer';
          handleRef.current.addEventListener('click', start, { once: true });
        }

        balls.forEach(ball => {
          const tl = gsap.timeline();
          const duration = 0.05 + Math.random() * 0.1;

          tl.to(ball.dom, {
            y: -(10 + Math.random() * 10),
            ease: 'power1.out',
            duration,
          }).to(ball.dom, {
            y: 0,
            duration,
            ease: 'power1.in'
          });

          setTimeout(() => {
            if (!started) {
              showHint();
            }
          }, 2000 * SPEED);
        });
      }
    });
  };

  const init = async () => {
    if (!appRef.current || !machineRef.current || !titleRef.current || !pointerRef.current) {
      console.log('Missing refs:', { 
        app: !!appRef.current, 
        machine: !!machineRef.current, 
        title: !!titleRef.current, 
        pointer: !!pointerRef.current 
      });
      return;
    }

    console.log('Initializing gacha machine...');
    appRef.current.classList.add('gotcha');
    
    const newPrize = await getPrize();
    setPrize(newPrize);
    
    const prizeImg = document.querySelector('.prize-container .prize img') as HTMLImageElement;
    if (prizeImg) {
      prizeImg.src = newPrize.image;
    }

    const TITLE = 'Good Luck!';
    const PRICE = '$1.00';

    const titleElement = machineRef.current.querySelector('.title') as HTMLElement;
    if (titleElement) {
      titleElement.innerHTML = [...TITLE].map(e => `<span>${e}</span>`).join('');
    }

    const priceElement = machineRef.current.querySelector('.price') as HTMLElement;
    if (priceElement) {
      priceElement.innerText = PRICE;
    }
    
    console.log('Creating balls...');
    createBalls();
    console.log('Balls created, total:', balls.length);

    gsap.set(machineRef.current, {
      y: '100vh'
    });

    gsap.set(titleRef.current, {
      y: '120vh'
    });

    gsap.set(pointerRef.current, {
      opacity: 0
    });

    gsap.set('.prize-reward-container', {
      opacity: 0
    });

    setTimeout(prepare, 500 * SPEED);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      init();
    }, 100);
    return () => clearTimeout(timer);
  }, [init]);

  return (
    <main className="h-full overflow-hidden pt-16">
      <div className="relative w-full h-[calc(100%-4rem)] flex items-center justify-center">
        <div id="app" ref={appRef} className="w-full">
          <div className="container mx-auto">
            <div className="game-layer">
          <div className="machine-container" ref={machineRef}>
            <div className="backboard"></div>
            <div className="balls" ref={ballsRef}></div>
            <img className="machine" src="https://assets.codepen.io/2509128/gotcha.svg" alt="Gacha Machine" />
            <div className="title"></div>
            <div className="price"></div>
            <img className="handle" src="https://assets.codepen.io/2509128/handle.svg" alt="Handle" ref={handleRef} />
            <div className="pointer" ref={pointerRef}>
              <img src="https://assets.codepen.io/2509128/point.png" alt="Pointer" />
            </div>
          </div>
        </div>
        <div className="ui-layer">
          <div className="title-container">
            <div className="title" ref={titleRef}>
              <h2 className="wiggle">Tap to get a prize!</h2>
            </div>
          </div>
          <div className="prize-container">
            <div className="prize-ball-container"></div>
            <div className="prize-reward-container">
              <div className="shine">
                <img src="https://assets.codepen.io/2509128/shine.png" alt="Shine" />
              </div>
              <div className="prize">
                <img className="wiggle" src="https://assets.codepen.io/2509128/prize1.png" alt="Prize" />
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GachaMachine;