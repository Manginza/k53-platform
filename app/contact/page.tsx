import React from 'react';
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/contact';

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Contact Us</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">
          We are here to help you succeed! If you have any questions, encounter any issues, or just want to provide feedback, please do not hesitate to get in touch with us.
        </p>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-8 text-center max-w-md mx-auto">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Support</h2>
          <p className="text-gray-500 text-sm mb-6">
            The fastest way to reach us is directly through WhatsApp. We are available to help you with platform access, billing, and technical questions.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-full text-base hover:bg-green-700 transition-colors shadow-md"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
