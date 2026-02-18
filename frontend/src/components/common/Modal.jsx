import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="modal modal-open">
      <div className={`modal-box ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-base-100 pb-4 border-b z-10">
          <h3 className="font-bold text-2xl">{title}</h3>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-4">
          {children}
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default Modal;