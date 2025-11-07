import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getCourseById } from '../data/courses';

const Devoir = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(id);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [openChapters, setOpenChapters] = useState(() => new Set(['ch1']));
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false);

  
  const questionImageRef = useRef(null);


  const calculateProgress = () => {
    if (!course?.lessons) return 0;
    
    let totalMarks = 0;
    let earnedMarks = 0;
    
    course.lessons.forEach(lesson => {
      const [earned, total] = lesson.mark.split('/').map(Number);
      totalMarks += total;
      earnedMarks += earned;
    });
    
    return totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  };

  const progressPercentage = calculateProgress();

  const fileInputRef = useRef(null);
  const snackbarTimerRef = useRef(null);


  const handleLessonClick = (globalIndex) => {
    setCurrentQuestion(globalIndex);
    
    
    if (window.innerWidth < 1024 && questionImageRef.current) {
      setTimeout(() => {
        questionImageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  
  const chapters = [
    {
      id: 'ch1',
      title: 'البدء',
      subTitle: 'تعريف بالمحتوى',
      lessons: course.lessons.slice(0, 4), // First 4 lessons
    },
    {
      id: 'ch2',
      title: 'الامتحانات',
      subTitle: 'سلسلة الامتحانات',
      lessons: course.lessons.slice(4), // Remaining lessons
    },
  ];

  
  const handleSnackbar = (message, { error = false } = {}) => {
    setSnackbarMessage(message);
    setIsError(error);
    setShowSnackbar(true);

    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
    snackbarTimerRef.current = setTimeout(() => {
      setShowSnackbar(false);
      snackbarTimerRef.current = null;
    }, 4000);
  };

 
  useEffect(() => {
    return () => {
      if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    };
  }, []);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId); else next.add(chapterId);
      return next;
    });
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedFiles(prev => ({
        ...prev,
        [currentQuestion]: file
      }));
      handleSnackbar("تم رفع صورة الحل بنجاح", { error: false });
    }
  };


  const handleSubmit = () => {
    if (!uploadedFiles[currentQuestion]) {
      handleSnackbar("الرجاء رفع صورة الحل للدرس الحالي", { error: true });
      return;
    }
    handleSnackbar("تم إرسال الحل بنجاح!", { error: false });
  };

  if (!course || course.type !== 'devoir') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0E2A46] mb-4">الفرض غير موجود</h1>
            <button 
              onClick={() => navigate('/my-courses')}
              className="text-[#54C5F8] font-semibold"
            >
              العودة إلى دروسي
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* header */}
      <section className="w-full bg-[linear-gradient(180deg,rgba(84,197,248,0.12)_0%,rgba(84,197,248,0)_60%)]">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-8 pb-4 text-right">
          <div className="inline-flex items-center gap-2 bg-[#F0F5FF] text-[#7BA4FF] px-3 py-1 rounded-full text-[12px] font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7BA4FF]" />
            {course.category}
          </div>
          <h1 className="text-[22px] md:text-[26px] lg:text-[30px] font-extrabold text-[#0E2A46] leading-[1.6]">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="text-[#8CA0B3] text-[13px] md:text-sm mt-1">{course.subtitle}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pb-6 md:pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-4 md:gap-6 items-start">
         
          <div className="space-y-6">
            {/* Progress Section */}
            <div className="bg-[#54C5F8] rounded-[20px] md:rounded-[30px] p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="text-white text-2xl md:text-3xl font-bold">
                    {course.lessons[currentQuestion]?.mark || "0/5"}
                  </div>
                  <div className="hidden sm:block w-px h-16 bg-white"></div>
                  <div className="text-white text-xl md:text-3xl font-bold">
                    Time: {course.lessons[currentQuestion]?.time || "00:00"}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-white/20 rounded-[10px] px-3 md:px-4 py-2">
                    <span className="text-white text-sm">{progressPercentage}%</span>
                  </div>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center">
                    <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Section */}
            <div className="bg-white rounded-[20px] md:rounded-[30px] p-4 md:p-8 shadow-[0_15px_40px_5px_rgba(237,237,237,1)] relative">
              <div className="text-right mb-4 md:mb-6">
                <h3 className="text-[#696F79] text-lg md:text-xl font-normal mb-2 md:mb-4">أجب عن السؤال أدناه</h3>
              </div>
              
              {/* Question Image */}
              <div ref={questionImageRef} className="mb-4 md:mb-6 relative">
                <img 
                  src={course.lessons[currentQuestion]?.image || "/images/devoir-question-image.png"} 
                  alt="Question" 
                  className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover rounded-lg"
                />
               
              
              </div>

              {/* Photo Upload Section */}
              <div className="mb-6 md:mb-8">
                <div className="relative border-4 border-dashed border-[#CBD0DC] rounded-[30px] md:rounded-[40px] p-4 md:p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <span className="text-[#292D32] text-3xl md:text-4xl">📷</span>
                  </div>
                  <p className="text-[#292D32] text-lg md:text-xl font-medium mb-2">رفع صورة الحل</p>
                  <p className="text-[#A9ACB4] text-sm md:text-base">أرفق صورة حل السؤال</p>

                  {/* file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  {/* File picker button */}
                  <button 
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="mt-6 md:mt-8 px-6 md:px-10 py-3 md:py-4 rounded-2xl border border-[#CBD0DC] text-[#54575C] font-medium hover:bg-gray-50 text-sm md:text-base"
                  >
                    رفع الصورة
                  </button>

                  {uploadedFiles[currentQuestion] && (
                    <p className="mt-3 md:mt-4 text-xs md:text-sm text-green-600">
                      {uploadedFiles[currentQuestion].name} تم رفع الملف
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-6 md:px-8 py-3 bg-[#54C5F8] text-white rounded-lg hover:bg-[#4AB5E8] font-bold text-base md:text-lg"
                >
                  حمل حلك الان
                </button>
              </div>
            </div>

            {/* Download Section */}
            <div 
              className="bg-[#54C5F8] rounded-[20px] md:rounded-[30px] p-4 md:p-8 cursor-pointer hover:bg-[#4AB5E8] transition-colors"
              onClick={() => {
                // Create PDF download
                const link = document.createElement('a');
                link.href = course.lessons[currentQuestion]?.image || '/images/devoir-question-image.png';
                link.download = `solution-${course.lessons[currentQuestion]?.title || 'lesson'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                handleSnackbar("تم تحميل الحل بنجاح!", { error: false });
              }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-2xl md:text-4xl font-bold text-center sm:text-right">حمل الحل الان</div>
                <div className="w-20 h-24 md:w-24 md:h-28 bg-white rounded-[50px] md:rounded-[66px] flex items-center justify-center border-4 border-red-500 hover:bg-gray-50 transition-colors">
                  <div className="text-red-500 text-xs md:text-sm font-bold">PDF</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="rounded-[12px] md:rounded-[16px] border border-[#D6E5F2] bg-[#EAF5FF] shadow-sm p-0 text-right overflow-hidden order-first xl:order-last">
            {/* Header */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-[#D6E5F2]">
              <h3 className="text-[#0E2A46] font-extrabold text-[16px] md:text-[18px]">محتوى الفرض</h3>
            </div>

            {/* Chapters */}
            <div className="py-2">
              {chapters.map((chapter) => {
                const isOpen = openChapters.has(chapter.id);
                return (
                  <div key={chapter.id} className="px-2 md:px-3">
                    {/* Chapter header */}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center gap-2 px-2 md:px-3 py-2 md:py-3 rounded-md border border-[#D6E5F2] bg-white/60 hover:bg-white transition-colors"
                    >
                      {/* Arrow */}
                      <span className={`text-[#0E2A46] transition-transform ${isOpen ? '' : '-rotate-90'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                          <path fillRule="evenodd" d="M12 14.5a.75.75 0 0 1-.53-.22l-3-3a.75.75 0 1 1 1.06-1.06L12 12.69l2.47-2.47a.75.75 0 0 1 1.06 1.06l-3 3a.75.75 0 0 1-.53.22Z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div className="flex-1 text-right">
                        <div className="text-[#0E2A46] text-[13px] md:text-[15px] font-bold">{chapter.title}</div>
                        <div className="text-[#2E73B7] text-[11px] md:text-[13px] font-semibold">{chapter.subTitle}</div>
                      </div>
                    </button>

                    {/* Lessons */}
                    {isOpen && (
                      <ul className="mt-1 md:mt-2 mb-2 md:mb-3 space-y-1 md:space-y-2">
                        {chapter.lessons.map((lesson, index) => {
                          const globalIndex = chapter.id === 'ch1' ? index : index + 4;
                          const isActive = currentQuestion === globalIndex;
                          return (
                            <li
                              key={lesson.id}
                              onClick={() => handleLessonClick(globalIndex)}
                              className={`flex items-center gap-2 rounded-lg border px-2 md:px-3 py-2 md:py-3 transition-colors cursor-pointer ${isActive ? 'bg-white border-[#54C5F8]' : 'bg-white/50 hover:bg-white border-[#D6E5F2]'}`}
                            >
                              <span className="text-[#0E6AA6] shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                  <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
                                  <path d="M10.5 8.75 15 12l-4.5 3.25V8.75Z" fill="currentColor" />
                                </svg>
                              </span>
                              <div className="flex-1 text-right pr-1">
                                <p className="text-[#0E2A46] text-[13px] md:text-[15px] font-semibold">{lesson.title}</p>
                                <div className="flex items-center gap-1 md:gap-2 mt-1">
                                  <span className="text-[#2E73B7] text-[10px] md:text-[12px] font-medium">{lesson.mark}</span>
                                  <span className="text-[#8CA0B3] text-[10px] md:text-[12px]">•</span>
                                  <span className="text-[#8CA0B3] text-[10px] md:text-[12px]">{lesson.time}</span>
                                </div>
                              </div>
                              <span className="text-[#0E6AA6] rotate-180 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                                  <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      {/* Snackbar */}
      {showSnackbar && (
        <div className="fixed inset-x-0 bottom-6 sm:bottom-20 flex justify-center z-50 pointer-events-none">
          <div className="max-w-[1120px] w-[92%] md:w-[82%] px-4">
            <div
              className={`mx-auto pointer-events-auto rounded-lg shadow-lg py-3 px-6 text-sm md:text-base text-white ${
                isError ? 'bg-red-600' : 'bg-[#20B486]'
              }`}
            >
              {snackbarMessage}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Devoir;