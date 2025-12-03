import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const HeroSection = () => {
  return (
    <section className="relative bg-white overflow-hidden">
     
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0F9FF] to-white"></div>

      {/* MOBILE VERSION */}
      <div className="block md:hidden">
        <div className="relative z-10 container mx-auto px-4 py-4 flex flex-col items-center justify-center gap-3">
          
          {/* lingo + Cards */}
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center">

              {/* lingo image with border circle */}
              <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                <div className="absolute w-[130px] h-[130px] rounded-full border-2 border-[#54C5F8] opacity-60"></div>
                <ImageWithFallback
                  src="/images/hero-image.png"
                  alt="Ramy School lingo"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              {/* Feature cards */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md border border-[#54C5F8] px-1 py-0.5 flex items-center gap-0.5 w-[80px] text-[8px]">
                <div className="w-2.5 h-2.5 border border-[#54C5F8] rounded-full relative">
                  <div className="absolute inset-0.5 border border-[#54C5F8] rounded-full"></div>
                  <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-[#54C5F8] rounded-full"></div>
                </div>
                <p className="text-[#101828] font-medium leading-none whitespace-nowrap">دورات عبر الإنترنت</p>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -left-8 bg-white shadow-md rounded-md border border-[#54C5F8] px-1 py-0.5 flex items-center gap-0.5 w-[80px] text-[8px]">
                <div className="w-2.5 h-2.5 bg-[#54C5F8] rounded text-white text-[6px] font-bold flex items-center justify-center">≡</div>
                <p className="text-[#101828] font-medium leading-none whitespace-nowrap">دورات مسجلة</p>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-8 bg-white shadow-md rounded-md border border-[#54C5F8] px-1 py-0.5 flex items-center gap-0.5 w-[80px] text-[8px]">
                <div className="w-2.5 h-2.5 bg-[#54C5F8] rounded text-white text-[6px] flex items-center justify-center">★</div>
                <p className="text-[#101828] font-bold leading-none whitespace-nowrap">أفضل الأساتذة</p>
              </div>
            </div>
          </div>

        
          <div className="text-center">
            <h1 className="text-base font-bold text-[#101828] leading-tight mb-1">
              اكتشف مع <span className="text-[#54C5F8]">رامي</span><br />
              سكول <span className="text-[#54C5F8]">أفضل</span> الدروس
            </h1>
            <p className="text-[10px] text-[#475467] max-w-sm mx-auto">
              منصة تعليمية شاملة مع أفضل المدرسين والدورات المتخصصة
            </p>
          </div>
        </div>

        {/* Mobile Blue Circles */}
        <div className="absolute top-4 left-2 w-4 h-4 bg-gradient-to-br from-[#54C5F8] to-[#24BB8C] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-4 right-2 w-3 h-3 bg-gradient-to-br from-[#54C5F8] to-transparent rounded-full opacity-40"></div>
        <div className="absolute top-1/3 right-4 w-2 h-2 bg-[#54C5F8] rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-4 w-5 h-5 border-2 border-[#54C5F8] rounded-full opacity-30"></div>
        <div className="absolute top-12 right-8 w-6 h-6 border border-[#54C5F8] rounded-full opacity-40 animate-ping"></div>
      </div>

      {/* DESKTOP/TABLET VERSION */}
      <div className="hidden md:block min-h-screen">
        <div className="relative z-10 container mx-auto px-4 md:px-8 xl:px-16 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-screen">

          {/* LEFT SIDE */}
          <div className="flex-1 w-full text-center lg:text-right order-2 lg:order-1 relative">
            
            {/* circleHero Image  */}
            <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 hidden lg:block z-0">
              <ImageWithFallback
                src="/images/circuleHero.png"
                alt="Decorative Circles"
                className="w-[300px] h-auto opacity-60"
              />
            </div>

           
            <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#101828] leading-tight mb-4">
              اكتشف مع <span className="text-[#54C5F8]">رامي</span><br />
              سكول <span className="text-[#54C5F8]">أفضل</span> الدروس
            </h1>

           
            <p className="text-lg lg:text-xl text-[#475467] relative z-10">
              منصة تعليمية شاملة مع أفضل المدرسين والدورات المتخصصة
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 w-full flex items-center justify-center order-1 lg:order-2">
            <div className="relative flex items-center justify-center w-full max-w-lg">
              
              {/* lingo with surrounding circle */}
              <div className="relative w-[340px] h-[340px] flex items-center justify-center">
            
             <div className="absolute w-[400px] h-[400px] rounded-full border-4 border-[#54C5F8] opacity-50 animate-pulse"></div>
                <div className="absolute w-[320px] h-[320px] rounded-full border-4 border-[#54C5F8] opacity-60"></div>
                
                <ImageWithFallback
                  src="/images/hero-image.png"
                  alt="Ramy School lingo"
                  className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                />
              </div>

              {/* Feature Card: Online */}
              <div className="absolute -top-[40px] left-1/2 transform -translate-x-1/2 
                              bg-gradient-to-r from-white to-[#F0F9FF] border border-[#54C5F8]/60 
                              shadow-lg rounded-full px-4 py-2 flex items-center gap-2 w-[130px] 
                              transition-transform duration-300 hover:scale-110 
                              animate-[float_4s_ease-in-out_infinite] z-20">
                <div className="w-5 h-5 border-2 border-[#54C5F8] rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#54C5F8] rounded-full"></div>
                </div>
                <p className="text-sm font-semibold text-[#101828]">دورات أونلاين</p>
              </div>

              {/* Feature Card: Recorded */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-[75px] 
                              bg-gradient-to-r from-white to-[#F0F9FF] border border-[#54C5F8]/60 
                              shadow-lg rounded-full px-4 py-2 flex items-center gap-2 w-[130px] 
                              transition-transform duration-300 hover:scale-110 
                              animate-[float_5s_ease-in-out_infinite] z-20">
                <div className="w-5 h-5 bg-[#54C5F8] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  ≡
                </div>
                <p className="text-sm font-medium text-[#101828]">دورات مسجلة</p>
              </div>

              {/* Feature Card: Best Teachers */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-[75px] 
                              bg-gradient-to-r from-white to-[#F0F9FF] border border-[#54C5F8]/60 
                              shadow-lg rounded-full px-4 py-2 flex items-center gap-2 w-[130px] 
                              transition-transform duration-300 hover:scale-110 
                              animate-[float_6s_ease-in-out_infinite] z-20">
                <div className="w-5 h-5 bg-[#54C5F8] rounded-full text-white text-[12px] flex items-center justify-center font-bold">
                  ★
                </div>
                <p className="text-sm font-bold text-[#101828]">أفضل الأساتذة</p>
              </div>
            </div>
          </div>
        </div>

       
        {/* Top section circles */}
        <div className="absolute top-10 left-10 w-12 h-12 bg-gradient-to-br from-[#54C5F8] to-[#24BB8C] rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-8 h-8 border-2 border-[#54C5F8] rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-32 left-32 w-6 h-6 bg-[#54C5F8] rounded-full opacity-30"></div>
        <div className="absolute top-16 right-40 w-4 h-4 bg-gradient-to-br from-[#54C5F8] to-transparent rounded-full opacity-60"></div>
        
        {/* Middle section circles */}
        <div className="absolute top-1/3 left-8 w-10 h-10 border border-[#54C5F8] rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-1/2 right-12 w-14 h-14 bg-gradient-to-br from-[#54C5F8]/20 to-transparent rounded-full opacity-70"></div>
        <div className="absolute top-2/3 left-20 w-5 h-5 bg-[#54C5F8] rounded-full opacity-50 animate-pulse"></div>
        
        {/* Bottom section circles */}
        <div className="absolute bottom-10 right-10 w-10 h-10 bg-gradient-to-br from-[#54C5F8] to-[#24BB8C] rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-16 w-7 h-7 border-2 border-[#54C5F8] rounded-full opacity-40"></div>
        <div className="absolute bottom-32 right-32 w-9 h-9 bg-gradient-to-br from-[#54C5F8]/30 to-transparent rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-[#54C5F8] rounded-full opacity-60"></div>
        
        {/* Corner accent circles */}
        <div className="absolute top-5 right-5 w-6 h-6 border border-[#54C5F8] rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-5 left-5 w-8 h-8 bg-gradient-to-br from-[#54C5F8]/40 to-transparent rounded-full opacity-50"></div>
        
        {/* Floating accent circles */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-[#54C5F8] rounded-full opacity-40 animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/4 w-11 h-11 border-2 border-[#54C5F8] rounded-full opacity-30"></div>
        <div className="absolute top-3/4 right-1/3 w-5 h-5 bg-gradient-to-br from-[#54C5F8] to-[#24BB8C] rounded-full opacity-50 animate-pulse"></div>
      </div>

      {/* Custom keyframes for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;