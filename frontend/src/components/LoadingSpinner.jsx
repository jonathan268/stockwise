import React from "react";
import { Loader, BarChart3 } from "lucide-react";

/**
 * LoadingSpinner - Affiche un indicateur de chargement élégant
 * Utilisé pour les transitions de pages et chargements asynchrones
 */
const LoadingSpinner = ({
  message = "Chargement en cours...",
  size = "md",
  fullScreen = true,
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const variants = {
    default: (
      <div className={`${sizeClasses[size]} animate-spin text-blue-600`}>
        <Loader strokeWidth={2} />
      </div>
    ),
    minimal: (
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin`}
      />
    ),
    bars: (
      <div className={`${sizeClasses[size]} text-blue-600`}>
        <BarChart3 className="animate-pulse" />
      </div>
    ),
    dots: (
      <div className="flex gap-2">
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    ),
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {variants[variant] || variants.default}
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
};

export default LoadingSpinner;
