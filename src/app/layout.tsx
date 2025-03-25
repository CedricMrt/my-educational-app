import type { Metadata } from "next";
import "./globals.css";
import { SchoolProvider } from "./utils/SchoolContext";
import { Toaster } from "react-hot-toast";

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
      <SchoolProvider>
        <body
          className={` bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat`}
        >
          <div className='bg-[#0000001c] h-[92.3vh] landscape:h-[87.6vh]'>
            <Toaster position='top-center' />
            {children}
          </div>
        </body>
      </SchoolProvider>
    </html>
  );
}
