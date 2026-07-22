import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReferralCapture from "@/components/ReferralCapture";
import CookieBanner from "@/components/CookieBanner";
import LiveSessionPopup from "@/components/LiveSessionPopup";
import TestPrepPopup from "@/components/TestPrepPopup";
import K53UnpackedPopup from "@/components/K53UnpackedPopup";
import CourseIntroPopup from "@/components/CourseIntroPopup";
import YoutubeLiveSessionPopup from "@/components/YoutubeLiveSessionPopup";
import FreePromoBanner from "@/components/FreePromoBanner";
import FreePromoPopup from "@/components/FreePromoPopup";

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
    metadataBase: new URL('https://www.skdriving.co.za'),
    title: {
        default: "Free K53 Learner's Licence Practice Tests | SK Driving",
        template: '%s | SK Driving',
    },
    description: "Pass your K53 learner's licence test first time. Free practice tests covering road signs, vehicle controls and rules of the road — for Code 8, Code 10 and Code 14 in South Africa.",
    keywords: [
        "learners licence test", "K53 learners licence", "learners licence practice test",
        "K53 test questions", "learners licence questions South Africa",
        "K53 road signs", "learners licence study guide", "how to pass learners licence",
        "Code 8 learners licence", "Code 10 learners licence", "free learners licence test online",
        "K53 questions and answers", "learners licence test South Africa",
        "learners licence road signs", "South African learner driver",
    ],
    openGraph: {
        siteName: "SK Driving",
        locale: 'en_ZA',
        type: 'website',
        title: "Free K53 Learner's Licence Practice Tests | SK Driving",
        description: "Pass your K53 learner's licence test first time. Free practice tests — road signs, vehicle controls, rules of the road — for all licence codes in South Africa.",
    },
    twitter: {
        card: 'summary_large_image',
        title: "Free K53 Learner's Licence Practice Tests | SK Driving",
        description: "Pass your South African learner's licence test first time. Free K53 practice tests online.",
    },
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

                      {/* Meta Pixel */}
                      <script
                            dangerouslySetInnerHTML={{
                                  __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1492132475472276');fbq('track','PageView');`,
                            }}
                      />
                      <noscript>
                            <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1492132475472276&ev=PageView&noscript=1" alt="" />
                      </noscript>
                      {/* End Meta Pixel */}

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
                        <FreePromoBanner />
                        <Navbar />
                  {children}
                        <Footer />
                        <CookieBanner />
                        <FreePromoPopup />
                        <TestPrepPopup />
                        <LiveSessionPopup />
                        <K53UnpackedPopup />
                        <CourseIntroPopup />
                        <YoutubeLiveSessionPopup />
                </body>
          </html>
        );
}
