import React from "react";

const TestimonialCardSkeletonLoading = () => {
  return (
    <div className="break-inside-avoid mb-5 bg-white rounded-2xl p-6 border border-[#BDB2A1]/20 animate-pulse">
      <div className="flex mb-3 space-x-1">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-5 h-5 bg-[#d9af6b]/70 rounded-full" />
          ))}
      </div>
      <div className="h-12 bg-[#d9af6b]/50 rounded mb-3" />
      <div className="flex justify-between items-center">
        <div className="w-6 h-6 bg-[#d9af6b]/50 rounded-full" />
        <div className="space-y-1 text-right w-20">
          <div className="h-4 bg-[#d9af6b]/50 rounded" />
          <div className="h-2 bg-[#d9af6b]/30 rounded" />
        </div>
      </div>
    </div>
  );
};
export default TestimonialCardSkeletonLoading;

