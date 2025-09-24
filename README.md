# AI Games Collection

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This project is a collection of fun and interactive games built with Next.js. It was originally created for my son who loves several of these games. I later discovered that these games can be incorporated into projects as background elements or loading screens to enhance user experience. I'm continuously exploring ways to improve the user experience and add more engaging features.

You can see live demos of these games at [games.nzlouis.com](https://games.nzlouis.com).

## Games Collection

### 1. AI Fish (AI 鱼)

An interactive underwater world where you can feed the fish and watch them swim around. You can even add your own custom fish by uploading images. The fish intelligently swim toward food when dropped into the tank, creating an engaging and dynamic aquatic environment.

### 2. Air Balloon (热气球)

Navigate a hot air balloon through a scenic landscape while managing your fuel. The game requires careful control to avoid trees and maintain altitude. Press and hold to make the balloon rise, and release to let it fall. Strategic flying close to the ground helps conserve fuel.

### 3. Arrows Defense (箭矢防御)

A fast-paced defense game where you control a cannon to shoot down incoming arrows. The AI automatically targets the closest threats, but you can also take manual control. The game features explosive effects and screen shake for immersive gameplay.

### 4. Geometry Dash (几何冲刺)

A challenging platformer where you control a cube that must jump over obstacles. The game features gravity-based physics, where the cube falls when not jumping. Avoid obstacles and collect bonus points by passing through green circles that appear randomly.

### 5. Rock Paper Scissors (石头剪刀布)

A CSS-powered implementation of the classic hand game. Choose rock, paper, or scissors and see the computer's randomized response. The game determines the winner based on classic rules with smooth animations.

### 6. Gacha Machine (扭蛋机)

An animated gacha machine where you can pull the lever to receive a random prize. The machine features realistic physics animations and confetti effects when you win. Each pull gives you a random plush toy prize.

### 7. Small Fish (小鱼)

A simple yet addictive fish-eating game where you control a small fish that must eat smaller fish to grow while avoiding larger predators.

### 8. Swimming Fish (游泳的鱼)

An elegant fish swimming simulation with smooth animations and a calming underwater environment.

### 9. Desktop Pet (桌面宠物)

A virtual pet that lives on your desktop, providing companionship and entertainment as it moves around your screen.

## Responsive Design

This project is fully responsive and adapts to all device sizes:

- Mobile (xs): < 480px
- Tablet (sm): 480px - 639px
- Laptop (md): 640px - 767px
- Desktop (lg): 768px - 1023px
- Wide Screen (xl): 1024px - 1279px
- Ultra Wide (2xl): 1280px+

The responsive design is implemented using:

- Tailwind CSS responsive utilities
- Custom device detection hooks
- Responsive context provider
- Device-specific styling adjustments

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
