import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const Footer = () => {
  return (
    <footer className="bg-[#54C5F8] text-white relative overflow-hidden">
      {/* footer content */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
        {/* Two columns layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* PART 1: Location Information */}
          <div className="flex flex-col items-center justify-center text-center gap-6 md:border-r md:border-white/30 md:pr-8 order-2 md:order-1">
            <div>
              <h4 className="text-2xl md:text-3xl font-bold mb-6"> الموقع</h4>
              
              {/* Location Map Embed */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3217.2401329552463!2d6.5891143!3d36.2579486!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f171b60b6f62a9%3A0xd7d181688d1e9862!2sRamy%20School!5e0!3m2!1sar!2sdz!4v1765987942626!5m2!1sar!2sdz"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>

              {/* Address Details */}
              <div className="space-y-3 text-left md:text-center">
              
                <p className="text-base md:text-lg text-center">
                  <span className="font-bold"> الهاتف:</span> <span className="whitespace-nowrap">
                    50-70-96-0669
                    </span>
                </p>
               
              </div>
            </div>
          </div>

          {/* PART 2: School Information and Social Links */}
          <div className="flex flex-col items-center justify-center text-center gap-8 order-1 md:order-2">
            
            {/* Logo/Mascot */}
            <div className="flex-shrink-0">
              <div className="w-[220px] h-[220px] md:w-[250px] md:h-[250px] bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
                <ImageWithFallback
                  src="/images/hero-image.png"
                  alt="Ramy School Mascot"
                  className="w-[150px] h-[150px] md:w-[180px] md:h-[180px] object-contain"
                />
              </div>
            </div>

            {/* School Name and Tagline */}
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Ramy School</h3>
              <p className="text-lg md:text-xl lg:text-2xl font-medium">إعادة ابتكار التعلّم</p>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-xl md:text-2xl font-bold mb-4">تابعنا</h4>
              <div className="flex gap-4 justify-center">
                
                <a
                  href="https://www.facebook.com/Ramyschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base cursor-pointer transition-all duration-300 hover:text-green-600 hover:underline"
                >
                  فايسبوك
                </a>

                <a
                  href="https://www.tiktok.com/@ramy.school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base cursor-pointer transition-all duration-300 hover:text-green-600 hover:underline"
                >
                  تيك توك
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
