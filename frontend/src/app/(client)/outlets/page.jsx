"use client";
import React, { useState } from "react";
import { MapPin, Phone, Clock, Navigation, Image as ImageIcon } from "lucide-react";
import { Hazratbal, Parepora } from "@/assets";
const OutletsPage = () => {
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  const outlets = [
    {
      id: 1,
      name: "Parray Pora",
      title: "Main Outlet",
      address: "01, New Airport Road, Parray Pora",
      city: "Srinagar, Kashmir",
      pincode: "190005",
      phone: "9419019717",
      hours: "9:00 AM - 8:00 PM",
      location:"https://maps.app.goo.gl/9pH7yuiAjg5n1HuF6",
      image: Parepora,
      isMain: true,
    },
    {
      id: 2,
      name: "Hazratbal",
      title: "University Outlet",
      address: "Opposite Kashmir University",
      city: "Hazratbal, Srinagar",
      pincode: "190006",
      phone: "9419019717",
      hours: "9:00 AM - 8:00 PM",
      locationLink:"https://maps.app.goo.gl/pjYMRWP2yHRMx49Q8",
      image: Hazratbal,
      isMain: false,
    },
    {
      id: 3,
      name: "Pulwama",
      title: "Latest Branch",
      address: "New Court Road, Near Degree College",
      city: "Pulwama, Kashmir",
      pincode: "192301",
      phone: "9419019717",
      hours: "9:00 AM - 8:00 PM",
      locationLink: "https://maps.app.goo.gl/FqXnvR1EbqJ7JuD78",
      image: "/images/outlets/pulwama.jpg",
      isMain: false,
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      {/* Hero Section with Map */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>

        <div className="container px-6 relative z-10">
          {/* Elegant divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-[var(--primary-color)]/30 flex-1 max-w-24"></div>
            <div className="mx-8">
              <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></div>
            </div>
            <div className="h-px bg-[var(--primary-color)]/30 flex-1 max-w-24"></div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl md:text-6xl font-serif text-[var(--primary-color)] leading-tight">
              Visit Our Outlets
            </h1>
            <p className="text-xl md:text-2xl font-light text-[var(--text-color)] max-w-2xl mx-auto">
              Experience authentic Kashmiri walnut fudge at our heritage locations
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="pb-16">
        <div className="container px-4 md:px-6">
          <div className="">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Left Sidebar - Outlet List */}
                <div className="lg:col-span-2 md:p-6 p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  <h3 className="text-2xl font-serif text-[var(--primary-color)] mb-6">
                    Our Locations
                  </h3>
                  
                  {outlets.map((outlet) => (
                    <div
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(outlet.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        selectedOutlet === outlet.id
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]/5"
                          : "border-transparent hover:border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/5"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-serif text-lg text-[var(--primary-color)]">
                            {outlet.name}
                          </h4>
                          <p className="text-xs text-[var(--accent-color)] uppercase tracking-wider">
                            {outlet.title}
                          </p>
                        </div>
                        {outlet.isNew && (
                          <span className="bg-[var(--accent-color)] text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-[var(--text-color)] mb-3">
                        {outlet.address}, {outlet.city}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-[var(--text-color)]/70">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {outlet.hours}
                        </span>
                        <a
                          href={`tel:${outlet.phone}`}
                          className="text-[var(--primary-color)] hover:text-[var(--accent-color)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-3 h-3 inline mr-1" />
                          Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side - Map */}
                <div className="lg:col-span-3 min-h-[600px] bg-gray-100 relative">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106377.57573294!2d74.7450!3d34.0836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDA1JzAxLjAiTiA3NMKwNTAnNDIuMCJF!5e0!3m2!1sen!2sin!4v1234567890`}
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                  
                  {/* Floating CTA */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white rounded-lg p-4 shadow-xl">
                      <p className="text-sm text-[var(--text-color)] mb-2">
                        Need directions?
                      </p>
                      <a
                        href="https://www.google.com/maps/search/Moonlight+Walnut+Fudge+Srinagar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-[var(--primary-color)] text-white py-2 px-4 rounded-lg text-sm uppercase tracking-wider hover:bg-[var(--primary-color)]/90 transition-colors"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Open in Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Outlets with Images */}
      <section className="py-16">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary-color)] mb-4">
              Experience Our Heritage
            </h2>
            <p className="text-lg text-[var(--text-color)]/80">
              Step into tradition at any of our authentic locations
            </p>
          </div>

          <div className="space-y-16 max-w-7xl mx-auto">
            {outlets.map((outlet, index) => (
              <div
                key={outlet.id}
                className={`grid lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div
                  className={`${
                    index % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                    {/* Placeholder - replace with actual images */}
                    {/* <div className="w-full h-full bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--accent-color)]/20 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-[var(--primary-color)]/40" />
                    </div> */}
                    {/* When you have images, use: */}
                    <img
                      src={outlet.image.src}
                      alt={`${outlet.name} outlet`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Badge Overlay */}
                    {(outlet.isMain || outlet.isNew) && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-[var(--accent-color)] text-white text-xs uppercase tracking-wider px-4 py-2 rounded-full font-medium shadow-lg">
                          {outlet.isMain ? "Main Outlet" : "New Branch"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`space-y-6 ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <div>
                    <h3 className="text-3xl md:text-4xl font-serif text-[var(--primary-color)] mb-2">
                      {outlet.name}
                    </h3>
                    <p className="text-base text-[var(--accent-color)] uppercase tracking-wider mb-4">
                      {outlet.title}
                    </p>
                    
                    {outlet.isNew && (
                      <p className="text-[var(--text-color)] italic mb-4">
                        Our newest branch, opened in August 2025, bringing 129 years of tradition to Pulwama.
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-[var(--border-color)]/30"></div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-5 h-5 text-[var(--accent-color)] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[var(--text-color)] leading-relaxed">
                          {outlet.address}
                        </p>
                        <p className="text-[var(--text-color)]">{outlet.city}</p>
                        <p className="text-sm text-[var(--text-color)]/70">
                          {outlet.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-[var(--accent-color)] flex-shrink-0" />
                      <a
                        href={`tel:${outlet.phone}`}
                        className="text-[var(--primary-color)] text-lg hover:text-[var(--accent-color)] transition-colors"
                      >
                        {outlet.phone}
                      </a>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-[var(--accent-color)] flex-shrink-0" />
                      <span className="text-[var(--text-color)]">
                        {outlet.hours}
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <a
                      href={locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg text-sm uppercase tracking-wider hover:bg-[var(--primary-color)]/90 transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                    <a
                      href={`tel:${outlet.phone}`}
                      className="inline-flex items-center border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-6 py-3 rounded-lg text-sm uppercase tracking-wider hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-[var(--primary-color)]/5">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary-color)] mb-4">
              A Glimpse Inside
            </h2>
            <p className="text-lg text-[var(--text-color)]/80">
              See where the magic happens
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                {/* Placeholder - replace with actual gallery images */}
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary-color)]/30 to-[var(--accent-color)]/30 group-hover:scale-110 transition-transform duration-500"></div>
                {/* When you have images, use: */}
                {/* <img
                  src={`/images/gallery/${item}.jpg`}
                  alt={`Moonlight Fudge outlet ${item}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                /> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Can't Visit Us?
            </h2>
            <p className="text-lg mb-8 opacity-90">
             Call us to place your order and
              experience the authentic taste of Moonlight Walnut Fudge at your
              doorstep.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:9419019717"
                className="inline-flex items-center bg-white text-[var(--primary-color)] px-8 py-4 rounded-lg text-sm uppercase tracking-wider hover:bg-white/90 transition-colors font-medium"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call to Order: 9419019717
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OutletsPage;
