import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const Footer = () => {
  return (
    <footer className="bg-[#54C5F8] text-white relative overflow-hidden">
      {/* footer content */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
        <div className="flex flex-col items-center justify-center text-center gap-10">
          
          {/* lingo */}
          <div className="flex-shrink-0">
            <div className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
              <ImageWithFallback
                src="/images/hero-image.png"
                alt="Ramy School Mascot"
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] object-contain"
              />
            </div>
          </div>

          {/* RamySchool info */}
          <div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Ramy School</h3>
            <p className="text-lg md:text-xl lg:text-2xl font-medium">إعادة ابتكار التعلّم</p>
          </div>

 {/* Social links */}
<div>
  <h4 className="text-xl md:text-2xl font-bold mb-4">تابعنا</h4>
  <div className="flex flex-col md:flex-row gap-4 justify-center">
    
    <a
      href="https://www.facebook.com/Ramyschool"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm md:text-base cursor-pointer transition-all duration-300 hover:text-green-600 hover:underline"
    >
      فايسبوك
    </a>

    <a
      href="https://www.instagram.com/ramy.school/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm md:text-base cursor-pointer transition-all duration-300 hover:text-green-600 hover:underline"
    >
      انستغرام
    </a>

  </div>
</div>

        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-white/20 relative z-10">
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-base md:text-lg font-bold">Ramy School.</p>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 text-xs md:text-sm">
              <p>Copyrights ©2025</p>
              <p>All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
