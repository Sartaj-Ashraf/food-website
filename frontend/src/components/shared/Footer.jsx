import React from 'react'
import { FaInstagram, FaYoutube, FaWhatsapp, FaFacebook } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { NewLogo } from '@/assets'
const Footer = () => {  
  return (
<footer className="bg-[var(--background-color)] border-t border-[var(--border-color)]/20 py-16">
        <div className="container px-6">
          <div className="text-center">
            <div className="mx-auto w-fit mb-2">
              <Image src={NewLogo} alt="Moonlight Logo" width={500} height={500} className=" w-48 h-48  object-cover " />
            </div>
            <p className="text-[var(--text-color)] mb-4 max-w-md mx-auto">
              Crafting sweet memories since 1896, one piece at a time.
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <Link
                href="https://www.instagram.com/moonlight_thewalnutfudge_shop/"
                className="text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors duration-300"
              >
                <FaInstagram className="h-6 w-6" />
              </Link>
              <Link
                href="https://wa.me/+919811055555"
                className="text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors duration-300"
              >
                <FaWhatsapp className="h-6 w-6" />
              </Link>
              <Link
                href="https://www.facebook.com/moonlightfudge"
                className="text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors duration-300"
              >
                <FaFacebook className="h-6 w-6" />
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]/20 text-[var(--text-color)] text-sm">
              © 2025 Moonlight Walnut Fudge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>  )
}

export default Footer