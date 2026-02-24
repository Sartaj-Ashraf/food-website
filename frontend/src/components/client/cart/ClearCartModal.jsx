import React from "react";

const ClearCartModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0  backdrop-blur-xs z-[60]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] ">
        <div className="bg-white rounded-t-3xl shadow-lg  mx-auto">
          {/* Content */}
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-2">
              Clear Cart?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              All items will be removed from your cart.
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-md
                         hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[var(--delete-color)] border border-[var(--delete-color)] cursor-pointer hover:text-[var(--delete-color)] hover:bg-[var(--background-color)] text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClearCartModal;