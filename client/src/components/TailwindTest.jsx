import React from "react";

const TailwindTest = () => {
  return (
    <div className="p-6 max-w-sm mx-auto mt-8 bg-purple-100 rounded-xl shadow-md flex items-center space-x-4">
      <div className="shrink-0">
        <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          FT
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-purple-900">Tailwind Test</div>
        <p className="text-purple-500">
          This text should be purple if Tailwind is working!
        </p>
      </div>
    </div>
  );
};

export default TailwindTest;
