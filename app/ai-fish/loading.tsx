export default function Loading() {
  return (
    <div className="fixed inset-0 mt-14 flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        <p className="mt-4 text-white text-lg font-semibold">Loading Aquarium...</p>
      </div>
    </div>
  );
}
