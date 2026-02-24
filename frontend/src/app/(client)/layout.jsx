"use client"
import "../global.css";

import { Playfair_Display, Poppins } from 'next/font/google';
import { Footer, Navbar } from "../../components";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],        // Choose weights as needed
  style: ['italic'],             // Enable italic style
  variable: '--font-playfair',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`antialiased ${playfair.variable} ${poppins.variable}`}>
      <body>
        <Navbar />
        <div className="">
          {children}
        </div>
        <Footer />
        
      </body>
    </html>
  );
}