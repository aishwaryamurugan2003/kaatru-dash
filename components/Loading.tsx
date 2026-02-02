import React from "react";

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = "Loading...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "fixed inset-0 bg-black bg-opacity-30 z-50" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-700">{text}</span>
      </div>
    </div>
  );
};

export default Loading;
