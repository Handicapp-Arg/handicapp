import React from 'react';

export default function LoadingCaballoDetail() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse p-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column (Image) */}
        <div className="w-full md:w-1/3 max-w-[400px]">
          <div className="aspect-[4/3] bg-gray-200 rounded-md"></div>
          <div className="mt-4 space-y-2">
             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Right Column (Info) */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
             <div className="h-10 bg-gray-200 rounded-md w-1/2"></div>
             <div className="h-6 bg-gray-100 rounded w-1/3"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
             {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-md"></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
