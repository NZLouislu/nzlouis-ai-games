"use client";
import { useRef, useEffect, useState } from "react";
import useGameEngine from "../../hooks/useGameEngine";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export default function GeometryDashPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const {
    score,
    gameOver,
    resetGame,
    gameRunning,
    togglePause,
    isMuted,
    toggleMute,
  } = useGameEngine(canvasRef);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(mobile);
  }, []);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div
      className="w-full bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 relative w-full">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-white font-bold text-xl">Score: {score}</div>
          {/* <button
            onClick={togglePause}
            className="mt-2 flex items-center justify-center w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-1 transition-all duration-200"
          >
            {gameRunning ? (
              <>
                <Pause size={16} className="mr-1" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} className="mr-1" />
                <span>Resume</span>
              </>
            )}
          </button> */}
        </div>

        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={toggleMute}
            className="flex items-center justify-center w-full bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-200"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
              <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
              <p className="text-2xl text-white mb-2">Score: {score}</p>
              <button
                onClick={handlePlayAgain}
                className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
