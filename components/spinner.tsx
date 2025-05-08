import { useEffect, useState } from "react";

export const Spinner = ({
  size = "medium",
  color = "green",
  text = "Đang tải dữ liệu...",
  showText = true,
}) => {
  const [mounted, setMounted] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Determine spinner size class
  let spinnerSize = "h-6 w-6"; // default medium
  if (size === "small") {
    spinnerSize = "h-4 w-4";
  } else if (size === "large") {
    spinnerSize = "h-10 w-10";
  }

  // Determine spinner color class
  let spinnerColor = "border-green-500"; // default green
  if (color === "blue") {
    spinnerColor = "border-blue-500";
  } else if (color === "red") {
    spinnerColor = "border-red-500";
  } else if (color === "yellow") {
    spinnerColor = "border-yellow-500";
  } else if (color === "purple") {
    spinnerColor = "border-purple-500";
  } else if (color === "gray") {
    spinnerColor = "border-gray-400";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center transition-opacity min-h-[60vh] duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-t-transparent ${spinnerColor}`}
      ></div>
      {showText && text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};
