"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleHome() {
    setOpen(false);
    try {
      window.focus();
    } catch {}
    setTimeout(() => {
      router.push("/");
    }, 10);
  }

  const items = [
    { label: "🎮 Geometry Dash", href: "/geometry-dash" },
    { label: "🖐️ Rock Paper Scissors", href: "/rock-paper-scissors" },
    { label: "🐟 Swimming Fish", href: "/swimming-fish" },
    // { label: "🐠 Small Fish", href: "/small-fish" },
    { label: "🏹 Arrows Defense", href: "/arrows-defense" },
    { label: "🎈 Air Balloon", href: "/air-balloon" },
    { label: "🐾 Desktop Pet", href: "/desktop-pet" },
    { label: "🛠 AI Fish", href: "/ai-fish" },
    // { label: "🎰 Gacha Machine", href: "/gacha-machine" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" onClick={handleHome} aria-label="Home">
          <Image
            src="/images/nzlouis-logo.png"
            alt="NZLouis logo — Louis Lu"
            width={100}
            height={30}
            priority
            className="w-[100px] h-[30px] object-contain"
          />
        </Link>

        <div className="hidden md:flex gap-6">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {i.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white/30 backdrop-blur-md shadow-md">
          <div className="flex flex-col gap-4 p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="block text-sm font-medium hover:text-blue-600 py-2"
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
