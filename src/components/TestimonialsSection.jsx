import React from 'react';
import { FaStar } from 'react-icons/fa';
import ImageWithFallback from './ImageWithFallback';

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#F8F9FA] relative overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left side */}
          <div className="w-full lg:w-1/2 text-center lg:text-right relative">
            
            {/*  wavy lines on the left side */}
            <div className="absolute -left-32 top-1/4 hidden xl:block">
              <ImageWithFallback
                src="/images/waveslines.png"
                alt="Decorative waves"
                className="w-40 h-60 object-contain opacity-60"
              />
            </div>

            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-[#1A202C] mb-8 leading-tight">
              آراء عملائنا
            </h2>

            {/* Star rating */}
            <div className="flex justify-center lg:justify-end gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-8 h-8 text-[#1A202C]" />
              ))}
            </div>

            <p className="text-[#4A5568] text-lg lg:text-xl font-medium leading-relaxed">
              أفضل الدورات عبر الإنترنت مع نخبة من المعلمين المتميزين.
            </p>
          </div>

          {/* Right side - Teacher image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative mx-auto w-full max-w-lg">
              <ImageWithFallback
                src="/images/TeacherTestimonial.png"
                alt="Teacher testimonial"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
