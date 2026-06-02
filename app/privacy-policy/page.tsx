import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mb-4">
          This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our platform.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Personal Information We Collect</h2>
        <p className="mb-4">
          When you visit the site, we may automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How Do We Use Your Personal Information?</h2>
        <p className="mb-4">
          We use the information that we collect generally to fulfill any orders placed through the Site, to communicate with you, and to screen our orders for potential risk or fraud.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Sharing Your Personal Information</h2>
        <p className="mb-4">
          We do not share your Personal Information with third parties except as necessary to provide our services or comply with applicable laws and regulations.
        </p>
      </div>
    </main>
  );
}
