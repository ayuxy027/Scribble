import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white border-2 border-black rounded-2xl shadow-2xl p-8 max-w-md w-full ${className}`}
    >
      {children}
    </div>
  );
};

export default Panel;