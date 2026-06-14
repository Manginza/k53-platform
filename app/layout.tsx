import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReferralCapture from "@/components/ReferralCapture";
import CookieBanner from "@/components/CookieBanner";
import LiveSessionPopup from "@/components/LiveSessionPopup";
import K53UnpackedPopup from "@/components/K53UnpackedPopup";
import BonusContentPopup from "@/components/BonusContentPopup";

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
                <head>
                      {/* Google tag (gtag.js) — GA4 G-ZZVWLTP51S */}
                      <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZZVWLTP51S" />
                      <script
                            dangerouslySetInnerHTML={{
                                  __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-ZZVWLTP51S');`,
                            }}
                      />
                      {/* End Google tag (gtag.js) */}

                      {/* Google Tag Manager */}
                      <script
                            dangerouslySetInnerHTML={{
                                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M995P8CW');`,
                            }}
                      />
                      {/* End Google Tag Manager */}

                      {/* Google AdSense */}
                      <meta name="google-adsense-account" content="ca-pub-4650201068372958" />
                      <script
                            async
                            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4650201068372958"
                            crossOrigin="anonymous"
                      />
                      {/* End Google AdSense */}
                </head>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
                      {/* Google Tag Manager (noscript) */}
                      <noscript>
                            <iframe
                                  src="https://www.googletagmanager.com/ns.html?id=GTM-M995P8CW"
                                  height="0"
                                  width="0"
                                  style={{ display: 'none', visibility: 'hidden' }}
                            />
                      </noscript>
                      {/* End Google Tag Manager (noscript) */}
                        <Suspense fallback={null}>
                                  <ReferralCapture />
                        </Suspense>
                        <Navbar />
                  {children}
                        <Footer />
                        <CookieBanner />
                        <LiveSessionPopup />
                        <K53UnpackedPopup />
                        <BonusContentPopup />
                </body>
          </html>
        );
}
