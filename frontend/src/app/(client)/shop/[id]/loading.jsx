// app/product/[id]/loading.js
export default function Loading() {
    return (
      <div className="mt-20 container min-h-screen">
        {/* Top Section */}
        <div className="bg-white p-4 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Image Gallery Skeleton */}
            <div className="animate-pulse flex  gap-4">
              <div className="flex gap-3 flex-col">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-20 w-20 bg-gray-200 rounded-md"
                  />
                ))}
              </div>
              <div className="w-full h-[500px] bg-gray-200 rounded-lg mb-4" />
            </div>
  
            {/* Right: Product Details Skeleton */}
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" /> 
              <div className="h-6 w-1/4 bg-gray-200 rounded" /> 
              <div className="h-4 w-1/2 bg-gray-200 rounded" /> 
              <div className="space-y-2 mt-6">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-4 w-full bg-gray-200 rounded" />
                ))}
              </div>
              <div className="h-12 w-40 bg-gray-300 rounded mt-6" /> 
            </div>
          </div>
        </div>
  
        {/* Description Section Skeleton */}
        <div className="mt-12 animate-pulse">
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-4" />
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-4 w-full bg-gray-200 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }
  