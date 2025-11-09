export default function Loading() {
  return (
    <div className="fixed inset-0 mt-14 flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-4 text-white text-lg font-semibold">Loading Game...</p>
      </div>
    </div>
  );
}
