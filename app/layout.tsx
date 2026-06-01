import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReferralCapture from "@/components/ReferralCapture";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "K53 Learner's Licence Platform",
    description: "Study for your K53 learner's licence with interactive courses and quizzes",
    verification: {
          google: "6uUYkLVNLPmMYVkSoW2wSlMcyOyA5MdR2vQxRUOUp7c",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
          <html lang="en">
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
                        <Suspense fallback={null}>
                                  <ReferralCapture />
                        </Suspense>
                        <Navbar />
                  {children}
                        <Footer />
                </body>
          </html>html>
        );
}</html>
