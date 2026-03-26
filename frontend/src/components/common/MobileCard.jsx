import React from "react";

const MobileCard = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 mb-3 active:scale-[0.98] transition-all ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {children}
    </div>
  );
};

export const MobileCardRow = ({ label, value, className = "" }) => {
  return (
    <div className={`flex justify-between items-center py-1 ${className}`}>
      <span className="text-sm text-base-content/60">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
};

export default MobileCard;
