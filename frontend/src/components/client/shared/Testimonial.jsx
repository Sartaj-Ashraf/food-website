import { Star } from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaGoogle,
} from "react-icons/fa";
import Image from "next/image";
import { chinarSVG } from "@/assets";
import { formatDate } from "@/utils/formateDate";
const Testimonial = ({ testimonial, index }) => {
  const random = Math.floor(Math.random() * 5) + 1;
  return (
    <div
      key={index}
      className="bg-white rounded-2xl p-6 mb-5 border border-[#BDB2A1]/10"
    >
      <div className="flex mb-3">
        {[...Array(testimonial?.rating)].map((_, i) => (
          <Image key={i} src={chinarSVG} alt="Star" width={20} height={20} />
        ))}
        {/* {[...Array(5 - random)].map((_, i) => (
        // <Star key={i} className="h-4 w-4 fill-[#D9AF6B] text-[#D9AF6B]" />
        <Image key={i} src={chinarSVGBlack} alt="Star" width={20} height={20} />
        
      ))} */}
      </div>
      <p className="text-[#5A432A] italic leading-relaxed mb-3 text-sm">
        "{testimonial.review}"
      </p>
      <div className="flex justify-between text-2xl items-center">
        <span>
          {testimonial.source === "instagram" && <FaInstagram size={18} />}
          {testimonial.source === "linkedin" && <FaLinkedinIn size={18} />}
          {testimonial.source === "youtube" && <FaYoutube size={18} />}
          {testimonial.source === "facebook" && <FaFacebookF size={18} />}
          {testimonial.source === "google" && <FaGoogle size={18} />}
        </span>
        <div className="text-right">
          <p className="font-medium text-[#5A432A] text-sm">
            {testimonial.name}
          </p>
          <p className="text-[#BDB2A1] text-xs">
            {formatDate(testimonial.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Testimonial;
