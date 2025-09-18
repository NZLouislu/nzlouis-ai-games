import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function Page() {
  return (
    <>
      <GoogleAnalytics />
      <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-8 text-center pt-16">
        <div className="relative z-10 max-w-4xl">
          {/* Animated title */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-6 animate-pulse">
            Welcome to AI Games
          </h1>
          
          {/* Subtitle with fade-in effect */}
          <div className="animate-fadeIn delay-700">
            <p className="text-xl md:text-2xl text-cyan-100 mb-10">
              A wonderful and fun world. Enjoy!
            </p>
          </div>
          
          {/* Decorative particles */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-400 rounded-full mix-blend-screen opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen opacity-30 animate-pulse-slower"></div>
        </div>
      </div>
    </>
  );
}
