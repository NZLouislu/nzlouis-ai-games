import GameCanvas from "@/components/platformer/GameCanvas";

export default function PlatformerPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-12 flex flex-col items-center">
      <div className="max-w-4xl w-full px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Platformer Adventure</h1>
            <p className="text-slate-400 mt-2">Inspired by griffpatch. Built with Next.js.</p>
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">60 FPS</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">BETA v1.0</span>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
          <GameCanvas />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-white font-semibold mb-2">Controls</h3>
            <p className="text-sm text-slate-400">Use Arrow keys or WASD to move and jump.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-white font-semibold mb-2">Physics</h3>
            <p className="text-sm text-slate-400">Features smooth gravity, friction, and collision handling.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-white font-semibold mb-2">Tutorial</h3>
            <p className="text-sm text-slate-400">Based on the advanced Scratch series by griffpatch.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
