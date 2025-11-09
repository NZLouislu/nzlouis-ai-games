export default function Loading() {
  return (
    <div className="fixed inset-0 mt-14 flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-700 text-lg font-semibold">Loading Pet...</p>
      </div>
    </div>
  );
}
