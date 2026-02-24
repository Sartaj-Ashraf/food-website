"use client";
import React, { useState } from "react";
import {
  ShoppingCart,
  User,
  Home,
  Store,
  MessageCircle,
  BookOpen,
  MoreVertical,
  LogOut,
  ShoppingBasket,
} from "lucide-react";
import { AuthModal, Cart, ActionModal } from "@/components";
import Link from "next/link";
import Image from "next/image";
import { useCartCount } from "@/hooks/useCartCount";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { NewLogo } from "@/assets";

const Navbar = () => {
  // State management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Custom hooks
  const { user, logout } = useAuth();
  const { cartCount } = useCartCount();

  // User authentication check
  const isUser = user && user != null && user.userId && user.role !== "guest";

  // Navigation links configuration
  const navLinks = [
    {
      icon: Home,
      name: "Home",
      label: "Home", // Short label for mobile
      href: "/",
    },
    {
      icon: ShoppingBasket,
      name: "Shop",
      label: "Shop",
      href: "/shop",
    },
    {
      icon: BookOpen,
      name: "Our Story",
      label: "Story",
      href: "/our-story",
    },
    {
      icon: Store,
      name: "Outlets",
      label: "Outlets",
      href: "/outlets",
    },
    {
      icon: MessageCircle,
      name: "Contact",
      label: "Contact",
      href: "/contact",
    },
  ];

  // Close dropdown handler
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Show logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    closeDropdown();
  };

  // Confirm logout with loading state
  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast.success("Logged out successfully!");
      setShowLogoutModal(false);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          onClick={closeDropdown}
          className="fixed inset-0 z-40 bg-transparent"
          aria-hidden="true"
        />
      )}
      {/* ========================================= */}
      {/* DESKTOP NAVBAR */}
      {/* ========================================= */}
      <nav className="shadow-md fixed top-0 w-full z-50 bg-[var(--background-color)]/95 backdrop-blur-md border-b border-[var(--border-color)]/10 hidden md:block">
        <div className="container px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className=" shadow-[0_4px_4px_rgba(0,0,0,0.1)] absolute top-2 bg-[var(--background-color)] backdrop-blur-md rounded-full  overflow-hidden"
              aria-label="Moonlight Homepage "
            >
              <Image
                src={NewLogo}
                alt="Moonlight Logo"
                width={100  }
                height={100}
                className="w-24 h-24 object-cover"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-8 ml-auto">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors duration-300"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}

              {/* Desktop Actions */}
              <div className="flex items-center gap-4">
                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative hover:text-[var(--primary-color)] transition-colors duration-300"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[var(--primary-color)] rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  {isUser ? (
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-8 h-8 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 font-medium"
                      aria-label="User menu"
                      aria-expanded={isDropdownOpen}
                    >
                      {user?.fullName?.[0]?.toUpperCase()}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md hover:bg-[var(--primary-color)] hover:text-white transition-colors duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  )}

                  {/* Desktop Dropdown Menu */}
                  {isDropdownOpen && isUser && (
                    <div className="absolute top-full right-0 mt-4 w-64 bg-[var(--background-color)] border border-[var(--border-color)]/20 rounded-lg shadow-lg backdrop-blur-md z-50">
                      {/* Dropdown Arrow */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-[var(--background-color)] border-l border-t border-[var(--border-color)]/20 transform rotate-45" />

                      <div className="relative z-10 p-4 space-y-4">
                        {/* User Info */}
                        <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-[var(--border-color)]/20">
                          <div className="w-12 h-12 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center text-lg font-medium">
                            {user?.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--primary-color)]">
                              {user?.fullName}
                            </p>
                            <p className="text-sm text-[var(--text-color)]/70">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-2">
                          <Link
                            href="/user/profile-details"
                            onClick={closeDropdown}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200"
                          >
                            <div className="w-9 h-9 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-medium">My Addresses</span>
                          </Link>

                          <Link
                            href="/user/orders"
                            onClick={closeDropdown}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200"
                          >
                            <div className="w-9 h-9 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center">
                              <ShoppingBasket className="w-4 h-4" />
                            </div>
                            <span className="font-medium">My Orders</span>
                          </Link>

                          <button
                            onClick={handleLogoutClick}
                            disabled={logoutLoading}
                            className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200 disabled:opacity-50"
                          >
                            <div className="w-9 h-9 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-medium">
                              {logoutLoading ? "Logging out..." : "Logout"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE HEADER */}
      {/* ========================================= */}
      <header className="fixed top-0 w-full z-50 bg-[var(--background-color)]/95 backdrop-blur-md shadow-lg border-b border-[var(--border-color)]/10 md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Moonlight Homepage" className="w-18 h-18 p-1 absolute top-2 bg-[var(--background-color)] rounded-full">
            <Image
              src={NewLogo}
              alt="Moonlight Logo"
              width={100}
              height={100}
              className="w-full h-full object-cover rounded-xl"
              priority
            />
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative hover:text-[var(--primary-color)] transition-colors duration-300 ml-auto"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[var(--primary-color)] rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION */}
      {/* ========================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background-color)]/95 backdrop-blur-md border-t border-[var(--border-color)]/20 md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          {/* Map through navLinks */}
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex flex-col items-center justify-center p-3 hover:text-[var(--primary-color)] transition-colors duration-300"
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs mt-1 font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* More Menu */}
          <div className="relative flex flex-col items-center justify-center p-3">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex flex-col items-center hover:text-[var(--primary-color)] transition-colors duration-300"
              aria-label="More options"
              aria-expanded={isDropdownOpen}
            >
              <MoreVertical className="w-4 h-4" />
              <span className="text-xs mt-1 font-medium">More</span>
            </button>

            {/* Mobile Dropup Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-3 right-0 min-w-[220px] bg-[var(--background-color)] border border-[var(--border-color)]/20 rounded-lg shadow-lg backdrop-blur-md z-50">
                {/* Dropdown Arrow */}
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-[var(--background-color)] border-r border-b border-[var(--border-color)]/20 transform rotate-45" />

                <div className="relative z-10 p-3">
                  {!isUser ? (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        closeDropdown();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-[var(--border-color)]/10 transition-colors duration-200 rounded-lg"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">Login</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex flex-col items-center gap-2 text-center pb-3 border-b border-[var(--border-color)]/20">
                        <div className="w-10 h-10 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center font-medium">
                          {user?.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--primary-color)]">
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-[var(--text-color)]/70">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <Link
                          href="/user/profile-details"
                          onClick={closeDropdown}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            My Addresses
                          </span>
                        </Link>

                        <Link
                          href="/user/orders"
                          onClick={closeDropdown}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200"
                        >
                          <ShoppingBasket className="w-5 h-5" />
                          <span className="text-sm font-medium">My Orders</span>
                        </Link>

                        <button
                          onClick={handleLogoutClick}
                          disabled={logoutLoading}
                          className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-[var(--border-color)]/10 transition-colors duration-200 disabled:opacity-50"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {logoutLoading ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MODALS */}
      {/* ========================================= */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Cart Slider */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Logout Confirmation Modal */}
      <ActionModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to logout, ${
          user?.fullName || "User"
        }?\n\nYou will need to login again to access your account.`}
        isLoading={logoutLoading}
      />
    </>
  );
};

export default Navbar;
