// app/shop/loading.js
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-24 space-y-2">
      <div className=" animate-pulse bg-gray-50 border border-gray-200 rounded-xl h-6 w-30"></div>
      <div className="md:flex gap-6">
        {/* Sidebar Skeleton */}
        <div className="animate-pulse bg-gray-50 border border-gray-200 p-5 rounded-xl w-full md:w-64 mb-6 md:mb-0">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-4 bg-gray-200 rounded my-2 w-full" />
          ))}
          <div className="h-10 bg-gray-300 rounded mt-4 w-full" />
        </div>
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-xl bg-gray-100 border border-gray-200 p-4 flex flex-col gap-4 min-h-[320px]"
            >
              <div className="h-36 rounded-lg bg-gray-200" />
              <div className="h-6 rounded bg-gray-200 w-3/4" />
              <div className="h-4 rounded bg-gray-200 w-1/2" />
              <div className="flex gap-2 mt-2">
                <div className="h-10 w-24 rounded bg-gray-300" />
                <div className="h-10 w-10 rounded bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
