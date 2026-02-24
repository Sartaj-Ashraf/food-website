"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import { Toaster } from "react-hot-toast";
import { store } from "../state/store";
import { Provider } from "react-redux";
import { AuthProvider } from "../hooks/useAuth";
import { CartCountProvider } from "../hooks/useCartCount";
import QueryProvider from "../reactQuery/QueryProvider";
import Script from "next/script";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* AuthProvider */}
        <AuthProvider>
          {/* Redux store */}
          <Provider store={store}>
            {/* React query client Providers */}
            <CartCountProvider>
            <QueryProvider>{children}</QueryProvider>
            </CartCountProvider>
          </Provider>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "8px",
            },
          }}
        />

        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
