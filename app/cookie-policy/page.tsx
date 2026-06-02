import React from 'react';

export default function CookiePolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Cookie Policy</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mb-4">
          This Cookie Policy explains how and why cookies, web beacons, pixels, and other similar technologies may be stored on and accessed from your device when you use our website.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies?</h2>
        <p className="mb-4">
          Cookies are small text files stored on your device by your web browser when you visit a website. They help the website remember information about your visit, which can make it easier to visit the site again and make the site more useful to you.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
        <p className="mb-4">
          We use cookies for a variety of reasons, such as to remember your preferences, understand how you interact with our site, and improve your overall user experience.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
        <p className="mb-4">
          You can control and manage cookies in your browser settings. However, please note that removing or blocking cookies can impact your user experience and parts of our website may no longer be fully accessible.
        </p>
      </div>
    </main>
  );
}
