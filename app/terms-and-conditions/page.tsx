import React from 'react';

export default function TermsAndConditions() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms and Conditions</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mb-4">
          Please read these terms and conditions carefully before using our service.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">User Responsibilities</h2>
        <p className="mb-4">
          You agree to use this platform responsibly and not to engage in any activity that could damage, disable, overburden, or impair the functioning of the site.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property Rights</h2>
        <p className="mb-4">
          The content on this website, including but not limited to text, graphics, logos, and images, is the property of the site owner and is protected by copyright laws.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service.
        </p>
      </div>
    </main>
  );
}
