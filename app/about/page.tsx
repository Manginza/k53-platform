import React from 'react';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">About Us</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">
          Welcome to the K53 Learner&apos;s Licence Platform! Our mission is to provide the most accessible, 
          comprehensive, and easy-to-use study materials for the South African K53 Learner&apos;s Licence test.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>
        <p className="mb-4">
          We believe that learning the rules of the road should be an engaging and straightforward experience. 
          By combining high-quality study notes with interactive quizzes, we ensure our users are fully 
          prepared to pass their tests on the first try.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Comprehensive Coverage:</strong> From road signs to vehicle controls, we cover everything.</li>
          <li><strong>Interactive Quizzes:</strong> Test your knowledge with our timed, exam-style questions.</li>
          <li><strong>Accessible Anywhere:</strong> Study on your phone, tablet, or computer.</li>
        </ul>
      </div>
    </main>
  );
}
