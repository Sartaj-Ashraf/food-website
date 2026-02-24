"use client";
import React from "react";
import { Edit2, Trash2, MapPin, Star } from "lucide-react";

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  // Extract address parts from the comma-separated location string
  const extractLocationDetails = (location) => {
    if (!location) return {};
    const parts = location.split(",").map((part) => part.trim());
    return {
      houseNumber: parts[0] || "",
      building: parts[1] || "",
      road: parts[2] || "",
      area: parts[3] || "",
    };
  };

  const locationDetails = extractLocationDetails(address.location);

  return (
    <div
      className={`rounded-xl p-6 transition-shadow shadow-sm hover:shadow-lg
        ${
          address.isDefault
            ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10"
            : "border-[var(--secondary-color)] bg-[var(--white)] hover:border-[var(--primary-color)]"
        }
        border-2  `}
    >
      {/* Header: Icon + Default Badge + Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--primary-color)]" />
          {address.isDefault && (
            <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 select-none">
              <Star className="w-3 h-3" />
              Default
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            aria-label="Edit Address"
            className="p-2 text-[var(--text-color)] hover:text-white hover:bg-[var(--primary-color)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(address._id)}
            aria-label="Delete Address"
            className="p-2 text-[var(--text-color)] hover:text-white hover:bg-[var(--primary-color)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 text-[var(--primary-color)] font-semibold grid grid-cols-2">
        <div>
          <span className="font-medium"> House No.:</span> {locationDetails.houseNumber || "N/A"}
        </div>
        <div>
          <span className="font-medium"> Building:</span> {locationDetails.building || "N/A"}
        </div>
        <div>
          <span className="font-medium"> Road:</span> {locationDetails.road || "N/A"}
        </div>
        <div>
          <span className="font-medium"> Area:</span> {locationDetails.area || "N/A"}
        </div>
      </div>

      {/* City, State, Postal Code */}
      <div className="mt-4 flex items-center gap-2 text-[var(--text-color)] font-semibold">
        <span>
          {address.city || "Unknown City"}, {address.state || "Unknown State"}
        </span>
        <span className="px-2 py-1 bg-[var(--secondary-color)] text-white rounded text-sm font-mono select-text">
          {address.postalCode || "000000"}
        </span>
      </div>

      {/* Country */}
      <p className="text-[var(--text-color)] text-sm mt-1 font-medium">{address.country || "India"}</p>

      {/* Set as Default Button */}
      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address._id)}
          className="mt-6 w-full py-2 px-4 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors font-semibold"
          aria-label="Set as Default Address"
        >
          Set as Default Address
        </button>
      )}
    </div>
  );
};

export default AddressCard;
