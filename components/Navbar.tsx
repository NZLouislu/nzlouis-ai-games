"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleHome(e?: React.MouseEvent) {
    setOpen(false);
    try {
      window.focus();
    } catch {}
    setTimeout(() => {
      router.push("/");
    }, 10);
  }

  const items = [{ label: "🛠 AI Fish", href: "/ai-fish" }];

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
              className="text-sm font-medium hover:text-blue-600 transition-colors"
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
          <div className="flex flex-col gap-4 p-4">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="block text-sm font-medium hover:text-blue-600"
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
