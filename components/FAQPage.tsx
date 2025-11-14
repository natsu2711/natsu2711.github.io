
import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="prose prose-lg max-w-none">
      <div className="text-center">
        <h1 className="text-4xl font-bold !mb-2">Frequently Asked Questions</h1>
        <div className="w-24 h-px bg-border mx-auto my-4"></div>
      </div>
      
      <h3 className="!mt-8 !mb-2">What is this blog about?</h3>
      <p>This is a personal blog covering topics like technology, art, music, and daily life.</p>
      
      <h3 className="!mt-8 !mb-2">Can I contact you?</h3>
      <p>Yes, please refer to the "About" page for contact information and ways to get in touch.</p>

      <h3 className="!mt-8 !mb-2">How is this site built?</h3>
      <p>This site is a custom-built application using modern web technologies like React and TypeScript to create a fast and responsive user experience.</p>
    </div>
  );
};

export default FAQPage;
