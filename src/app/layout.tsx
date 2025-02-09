import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SchoolProvider } from "./utils/SchoolContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Educational App",
  description: "App for school",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-screen`}
      >
        <div className='bg-[#0000001c] h-screen'>
          <SchoolProvider>
            <Toaster position='top-center' />
            {children}
          </SchoolProvider>
        </div>
      </body>
    </html>
  );
}
