import GoogleAnalytics from "@/components/GoogleAnalytics";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <div className="h-full flex flex-col">
      <GoogleAnalytics />
      <div className="flex-1 mt-14 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <div className="relative z-10 max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-6 animate-pulse">
            Welcome to AI Games
          </h1>

          <div className="animate-fadeIn delay-700">
            <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 mb-10">
              A wonderful and fun world. Enjoy!
            </p>
          </div>

          <div className="absolute -top-10 -left-10 w-20 h-20 sm:w-30 sm:h-30 md:w-40 md:h-40 bg-cyan-400 rounded-full mix-blend-screen opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -right-5 w-30 h-30 sm:w-40 sm:h-40 md:w-60 md:h-60 bg-pink-500 rounded-full mix-blend-screen opacity-30 animate-pulse-slower"></div>
        </div>
      </div>
      <Footer className="shrink-0" />
    </div>
  );
}
