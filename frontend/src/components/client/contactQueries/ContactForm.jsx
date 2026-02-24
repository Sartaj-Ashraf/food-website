"use client";
import React, { useState } from "react";
import { customFetch } from "@/utils/customFetch";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phoneNumber || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await customFetch.post("/queries", formData);

      setFormData({ name: "", phoneNumber: "", message: "" });
      setShowModal(true); // Show modal on success
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full p-4 rounded-3xl shadow-lg border border-[var(--primary-color)] backdrop-blur-sm">
        <h3 className="text-2xl md:text-3xl font-serif text-[var(--primary-color)] mb-2 text-center">
          Send us a message
        </h3>
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--primary-color)] mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full p-2.5 rounded-lg bg-transparent border border-[var(--primary-color)]/30 text-[var(--primary-color)] focus:border-[var(--secondary-color)]"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[var(--text-color)] mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full p-2.5 rounded-lg bg-transparent border border-[var(--text-color)]/30 text-[var(--primary-color)] focus:border-[var(--secondary-color)]"
              placeholder="Your Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-[var(--text-color)] mb-2"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="w-full p-2.5 rounded-lg bg-transparent border border-[var(--text-color)]/30 text-[var(--primary-color)] focus:border-[var(--secondary-color)]"
              placeholder="Your message..."
              value={formData.message}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary-color)] text-white px-6 py-3 text-sm uppercase tracking-wider rounded-full hover:bg-[var(--primary-color)]/90 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-[var(--primary-color)] mb-2">
              Message Sent!
            </h2>
            <p className="text-[var(--text-color)] mb-6">
              Thank you for contacting us. We will get back to you shortly.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-full hover:bg-[var(--primary-color)]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm;
