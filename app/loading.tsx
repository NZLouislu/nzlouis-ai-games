export default function Loading() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mt-14 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent"></div>
          <p className="mt-4 text-cyan-100 text-xl font-semibold">Loading...</p>
        </div>
      </div>
    </div>
  );
}
