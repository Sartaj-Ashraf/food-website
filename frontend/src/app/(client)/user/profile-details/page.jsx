"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Home
} from "lucide-react";
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setAddressToDefault,
} from "@/services/addressServices";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';

const AddressForm = dynamic(() => import("@/components/client/user/AddressForm"), { ssr: false });

import {  ActionModal, AddressCard } from "@/components";

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Helper function to show confirm modal
  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Helper function to close confirm modal
  const closeConfirm = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data, error } = await getAllAddresses();
    if (data.status === "success") {
      setAddresses(data.addresses);
    }
    if (error) {
      toast("Something went wrong");
      console.log(error);
    }
    setLoading(false);
  };
  const handleSaveAddress = async (addressData) => {
    if (editingAddress) {
      const { data, error } = await updateAddress(
        editingAddress._id,
        addressData
      );
      if (data) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddress._id ? data.address : addr
          )
        );
      }
      if (error) {
        toast("Something went wrong");
        console.log(error);
      }
    } else {
      const { data, error } = await createAddress(addressData);
      if (data) {
        setAddresses((prev) => [...prev, data.newAddress]);
      }
      if (error) {
        toast("Something went wrong");
        console.log(error);
      }
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmDelete = () => {
      deleteAddressById(addressId);
    };

    showConfirm(
      "Delete Address",
      "Are you sure you want to delete this address? This action cannot be undone.",
      confirmDelete
    );
  };

  const deleteAddressById = async (addressId) => {
    const { data, error } = await deleteAddress(addressId);
    if (data.status === "success") {
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      window.location.reload();
    }
    if (error) {
      toast("Something went wrong");
      console.log(error);
    }
  };

  const handleSetDefault = async (addressId) => {
    const { data, error } = await setAddressToDefault(addressId);
    if (data.status === "success") {
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr._id === addressId,
        }))
      );
      }
    if (error) {
      toast("Something went wrong");
      console.log(error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--white)] py-8 px-4 mt-16">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--primary-color)]">My Addresses</h1>
              <p className="text-[var(--primary-color)] mt-2">
                Manage your delivery addresses with smart location features
              </p>
            </div>
            <button
              onClick={handleAddNew}
              disabled={addresses.length >= 3}
              className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </button>
          </div>

          {addresses?.length >= 3 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800">
                You have reached the maximum limit of 3 addresses. Delete an
                existing address to add a new one.
              </p>
            </div>
          )}

          {addresses?.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-[var(--primary-color)] mb-2">
                No addresses yet
              </h3>
              <p className="text-[var(--primary-color)] mb-6">
                Add your first delivery address with smart location features
              </p>
              <button
                onClick={handleAddNew}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-color)] transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}

          {showForm && (
            <AddressForm
              address={editingAddress}
              onSave={handleSaveAddress}
              onCancel={handleCloseForm}
            />
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ActionModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </>
  );
};

export default AddressManagement;
