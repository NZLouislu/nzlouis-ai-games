"use client";

import React, { useEffect, useRef, useState } from "react";

function getIsDaytime() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

export default function DayNightBackground() {
  const [isDay, setIsDay] = useState(getIsDaytime());
  const [elements, setElements] = useState(() => {
    if (getIsDaytime()) {
      return [
        { id: 1, type: "cloud", x: 20, y: 20 },
        { id: 2, type: "cloud", x: 50, y: 40 },
        { id: 3, type: "cloud", x: 80, y: 30 },
      ];
    } else {
      return [
        { id: 1, type: "star", x: 20, y: 20 },
        { id: 2, type: "star", x: 60, y: 25 },
        { id: 3, type: "star", x: 85, y: 35 },
      ];
    }
  });

  const handleClick = (id: number) => {
    setElements((els) =>
      els.map((e) =>
        e.id === id
          ? {
              ...e,
              y: e.y - 50, // float upward slowly
            }
          : e
      )
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(getIsDaytime());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        background: isDay
          ? "linear-gradient(#87ceeb, #f0f8ff)"
          : "linear-gradient(#001d3d, #000814)",
        transition: "background 1s ease",
      }}
    >
      {isDay ? (
        <div>
          <div
            className="absolute rounded-full bg-yellow-400 shadow-lg"
            style={{
              width: 120,
              height: 120,
              top: 80,
              left: "50%",
              marginLeft: -60,
            }}
          />
          {elements.map((e) => (
            <div
              key={e.id}
              onClick={() => handleClick(e.id)}
              className="absolute bg-white rounded-full cursor-pointer transition-all duration-[3000ms] ease-linear"
              style={{
                width: 100,
                height: 60,
                top: `${e.y}%`,
                left: `${e.x}%`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      ) : (
        <div>
          <div
            className="absolute rounded-full bg-gray-200 shadow-lg"
            style={{
              width: 100,
              height: 100,
              top: 100,
              left: "50%",
              marginLeft: -50,
            }}
          />
          {elements.map((e) => (
            <div
              key={e.id}
              onClick={() => handleClick(e.id)}
              className="absolute bg-yellow-200 rounded-full cursor-pointer transition-all duration-[3000ms] ease-linear"
              style={{
                width: 20,
                height: 20,
                top: `${e.y}%`,
                left: `${e.x}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
