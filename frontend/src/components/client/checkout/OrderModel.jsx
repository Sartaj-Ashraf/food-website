"use client";
import React from "react";
import Link from "next/link";

const OrderModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--background-color)] rounded-lg p-6 max-w-md w-full shadow-2xl text-[var(--text-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Order Status</h2>
        <p className="mb-6">{message}</p>
        <div className="text-right">
          <Link
            href="/orders"
            onClick={onClose}
            className="text-[var(--primary-color)] font-semibold hover:underline"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
