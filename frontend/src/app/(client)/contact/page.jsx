import Link from "next/link";

import { ContactForm } from "@/components";

import { contact } from "@/assets";

import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <section
        className="py-16 md:py-24"
        style={{
          backgroundImage: `url(${contact.src})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right",
        }}
      >
        <div className="container px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 items-start mt-8 lg:mt-2">
            {/* Contact Form */}
            <ContactForm />
            {/* Contact Info + Social */}
            <div className="flex flex-col items-center md:items-start space-y-10">
              <div className="space-y-6 w-full ">
                <div className="flex items-start gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10 w-full backdrop-blur-sm  p-4">
                  <span className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4">
                    <Mail className="h-6 w-6 text-[var(--primary-color)]" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--primary-color)]">
                      Email Us
                    </h3>
                    <Link href="mailto:info@moonlightfudge.com" className="text-[var(--primary-color)]">
                      info@moonlightfudge.com
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10 w-full backdrop-blur-sm p-4">
                  <span className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4">
                    {" "}
                    <Phone className="h-6 w-6 text-[var(--primary-color)]" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--primary-color)]">
                      Call Us
                    </h3>
                    <Link href="tel:+919811055555" className="text-[var(--primary-color)]">
                      +91 9811055555
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10 w-full backdrop-blur-sm p-4">
                  <span className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4">
                    {" "}
                    <MapPin className="h-6 w-6 text-[var(--primary-color)] mt-1" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--primary-color)]">
                      Visit Us
                    </h3>
                    <p className="text-[var(--primary-color)]">
                    Block-A, 4RGP+RR Auqaf Building, New Shopping Complex, University Main Road, Hazaratbal, Srinagar
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-[var(--primary-color)]">
                  Follow Us
                </h3>
                <div className="flex space-x-6">
                  <Link
                    href="https://www.instagram.com/moonlight_thewalnutfudge_shop/"
                    className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4 text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors"
                  >
                    <FaInstagram className="h-6 w-6" />
                  </Link>
                  <Link
                    href="https://www.facebook.com/moonlightfudge"
                    className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4 text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors"
                  >
                    <FaFacebook className="h-6 w-6" />
                  </Link>
                  <Link
                    href="https://wa.me/+919811055555"
                    className="flex items-center justify-center text-center  gap-4 shadow-sm rounded-full bg-[var(--primary-color)]/10   p-4 text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors"
                  >
                    <FaWhatsapp className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-24 bg-[var(--background-color)]">
        <div className="container px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-serif text-[var(--primary-color)] mb-4">
              Find Us
            </h2>
            <p className="text-base text-[var(--text-color)]">
              Our location on the map.
            </p>
          </div>
          <div className="relative h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164861.51165827387!2d74.8379647!3d34.1275387!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e185b77b8a0c4b%3A0x139305e8cdec25ae!2zTW9vbiBMaWdodCAtIFRoZSBXYWxudXQgRnVkZ2UgU2hvcCDZhdmI2YYg2YTYp9q62ZTZuQ!5e1!3m2!1sen!2sin!4v1754043346447!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
