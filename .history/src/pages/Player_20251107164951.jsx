import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Quiz from "../components/Quiz";
import { courses } from "../data/courses";
import { chapterApi, videoApi, quizApi, api, getBaseUrl } from "../api/client";

const Player = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openChapters, setOpenChapters] = useState(new Set());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
       
        let fetchedCourse = null;
        try {
         
          fetchedCourse = await api.get(`/api/Courses/${id}`);
        } catch (err) {
         
          if (err.status !== 404) {
            console.error("Error fetching course from API:", err);
          }
        
          fetchedCourse = courses.find(c => c.id === id || c.id === parseInt(id));
        }
        
       
        if (!fetchedCourse) {
          setError("لم نتمكن من العثور على الدورة التعليمية المطلوبة");
          setLoading(false);
          return;
        }
        
        setCourse(fetchedCourse);

      
        try {
          const chaptersData = await chapterApi.getChaptersByCourseId(id);
          
          
          const filteredChapters = (chaptersData || []).filter(chapter => {
            const chapterCourseId = Number(chapter.courseId || chapter.CourseId);
            const currentCourseId = Number(id);
            return chapterCourseId === currentCourseId;
          });

          const fullChapters = await Promise.all(
            filteredChapters.map(async chapter => {
              try {
                const [videos, quizzes] = await Promise.all([
                  videoApi.getVideosByChapterId(chapter.id).catch(err => {
                    console.error(`Error fetching videos for chapter ${chapter.id}:`, err);
                    return [];
                  }),
                  quizApi.getQuizzesByChapterId(chapter.id).catch(err => {
                    console.error(`Error fetching quizzes for chapter ${chapter.id}:`, err);
                    return [];
                  })
                ]);
                
                
                const filteredVideos = (videos || []).filter(video => {
                  const videoChapterId = Number(video.chapterId || video.ChapterId);
                  const currentChapterId = Number(chapter.id);
                  return videoChapterId === currentChapterId;
                });

                const filteredQuizzes = (quizzes || []).filter(quiz => {
                  const quizChapterId = Number(quiz.chapterId || quiz.ChapterId);
                  const currentChapterId = Number(chapter.id);
                  return quizChapterId === currentChapterId;
                });

                
                const normalizedQuizzes = filteredQuizzes.map(q => ({
                  ...q,
                  questions: q.questions || q.question || []
                }));
                
                return {
                  ...chapter,
                  lessons: filteredVideos.map(video => {
                    return {
                      id: video.id,
                      title: video.title || `فيديو ${video.id}`,
                      url: video.url,
                      videoFile: video.videoFile || video.VideoFile, 
                      videoInfo: getVideoInfo(video.url, video.videoFile || video.VideoFile),
                    };
                  }),
                  quizzes: normalizedQuizzes,
                };
              } catch (err) {
                console.error(`Error fetching data for chapter ${chapter.id}:`, err);
                return {
                  ...chapter,
                  lessons: [],
                  quizzes: [],
                };
              }
            })
          );

          setChapters(fullChapters);
          
       
          if (fullChapters.length > 0 && fullChapters[0].lessons.length > 0) {
            setOpenChapters(new Set([fullChapters[0].id]));
            setSelectedLesson(fullChapters[0].lessons[0]);
          }
        } catch (err) {
          console.error("Error fetching chapters:", err);
         
          setChapters([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ أثناء تحميل محتوى الدورة. حاول مجدداً لاحقاً.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);



  const getVideoUrl = (videoPath) => {
    if (!videoPath) return null;
  
    if (videoPath.startsWith('http')) return videoPath;
   
    const baseUrl = getBaseUrl();
    
    const cleanPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
    return `${baseUrl}/${cleanPath}`;
  };

  const getVideoInfo = (url, videoFile) => {
    
   
    if (videoFile) {
      const videoFileUrl = getVideoUrl(videoFile);
      if (videoFileUrl) {
        const extension = videoFile.includes('.') ? videoFile.split('.').pop().toLowerCase() : 'mp4';
        return {
          type: 'direct',
          src: videoFileUrl,
          extension: extension
        };
      }
    }

    if (!url || url === 'placeholder-url') return { type: 'none', src: '' };

  
    const youtubeRegex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/${youtubeMatch[2]}`,
        videoId: youtubeMatch[2]
      };
    }

   
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        type: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
        videoId: vimeoMatch[3]
      };
    }

    
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
    if (videoExtensions.test(url)) {
      return {
        type: 'direct',
        src: url,
        extension: url.match(videoExtensions)[1].toLowerCase()
      };
    }

  
    if (url.includes('drive.google.com')) {
      const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
      if (driveMatch) {
        return {
          type: 'googledrive',
          src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
          videoId: driveMatch[1]
        };
      }
    }

  
    const dailymotionRegex = /dailymotion\.com\/video\/([^_]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    if (dailymotionMatch) {
      return {
        type: 'dailymotion',
        src: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
        videoId: dailymotionMatch[1]
      };
    }

   
    return {
      type: 'direct',
      src: url
    };
  };

 
  const toggleChapter = chapterId => {
    setOpenChapters(prev => {
      const updated = new Set(prev);
      updated.has(chapterId)
        ? updated.delete(chapterId)
        : updated.add(chapterId);
      return updated;
    });
  };


  const handleStartQuiz = async (quiz, chapterTitle) => {
    try {
      setShowQuiz(false);
      
      const full = await quizApi.getById(quiz.id);
      const questions = full?.questions || full?.question || quiz.questions || [];
      const normalized = { ...quiz, ...full, questions: Array.isArray(questions) ? questions : [] };
      setSelectedQuiz(normalized);
      setShowQuiz(true);
    } catch (err) {
      console.error('Failed to load quiz details for modal:', err);
      
      setSelectedQuiz(quiz);
      setShowQuiz(true);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setSelectedQuiz(null);
  };

  const renderVideoPlayer = () => {
    if (!selectedLesson) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            <p className="text-sm opacity-75">اختر درساً للبدء</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        {(() => {
        
          const videoFilePath = selectedLesson?.videoFile;
          const url = selectedLesson?.url || '';

        
          if (videoFilePath && videoFilePath !== 'placeholder-url') {
            const baseUrl = getBaseUrl(); 
            
            
            const urlAttempts = [
             
              `${baseUrl}${videoFilePath.startsWith('/') ? videoFilePath : '/' + videoFilePath}`,
            
              `${baseUrl}/videos/${videoFilePath.replace('/videos/', '')}`,
           
              `${baseUrl}/files${videoFilePath.startsWith('/') ? videoFilePath : '/' + videoFilePath}`,
            
              `${baseUrl}/static${videoFilePath.startsWith('/') ? videoFilePath : '/' + videoFilePath}`
            ];
            
          
            const videoUrl = urlAttempts[0];
            
            return (
              <div className="relative w-full h-full">
                <video 
                  className="w-full h-full" 
                  controls 
                  controlsList="nodownload"
                  onError={(e) => {
                    
                   
                    if (urlAttempts.length > 1) {
                      e.target.src = urlAttempts[1];
                    }
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              </div>
            );
          }

        
          if (url && url !== 'placeholder-url') {
         
            if (url.startsWith('/videos/') || /\.(mp4|webm|ogg)$/i.test(url)) {
              
              const baseUrl = getBaseUrl(); 
              const fullVideoUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
              
              return (
                <video 
                  className="w-full h-full" 
                  src={fullVideoUrl}
                  controls 
                  controlsList="nodownload"
                  onError={(e) => {
                  }}
                >
                  <source src={fullVideoUrl} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              );
            }
            
          
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
            const youtubeMatch = url.match(youtubeRegex);
            
            if (youtubeMatch) {
              const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
              
              return (
                <iframe
                  className="w-full h-full"
                  src={embedUrl}
                  title="Course video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              );
            }
            
          
            if (/\.(mp4|webm|ogg)$/i.test(url)) {
              return (
                <video 
                  className="w-full h-full" 
                  src={url} 
                  controls 
                  controlsList="nodownload"
                />
              );
            }
          }
      
          return (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <p className="text-sm opacity-75">لا يوجد فيديو متاح</p>
                <p className="text-xs mt-2 opacity-50">
                  Debug: file="{videoFilePath}", url="{url}"
                </p>
                <button 
                  onClick={() => {
                  }}
                  className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded"
                >
                  Log Full Data
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

 
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#54C5F8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#0E2A46]">جاري تحميل المحتوى...</h2>
          <p className="text-gray-600 mt-2">يرجى الانتظار بينما نقوم بتحميل محتوى الدورة</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">حدث خطأ</h1>
          <p className="text-[#0E2A46] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#54C5F8] text-white px-6 py-2.5 rounded-lg hover:bg-[#3ab1e8] transition font-semibold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0E2A46] mb-3">الدورة غير موجودة</h1>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على الدورة التعليمية المطلوبة</p>
          <Link
            className="inline-block bg-[#54C5F8] text-white px-6 py-2.5 rounded-lg hover:bg-[#3ab1e8] transition font-semibold"
            to="/my-courses"
          >
            العودة إلى دروسي
          </Link>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <section className="w-full bg-[linear-gradient(180deg,rgba(84,197,248,0.12)_0%,rgba(84,197,248,0)_60%)]">
        <div className="max-w-[1120px] mx-auto px-6 pt-8 pb-4 text-right">
          <div className="inline-flex items-center gap-2 bg-[#F0F5FF] text-[#7BA4FF] px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7BA4FF]" />
            {course.category || course.teacherName || 'General'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0E2A46]">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="text-[#8CA0B3] text-sm mt-1">{course.subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1120px] mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
        {/* Video Player */}
        <div className="rounded-2xl overflow-hidden shadow-md bg-white border">
          <div className="aspect-[16/9] bg-black">
            {renderVideoPlayer()}
          </div>
          <div className="p-4 text-right">
            <h2 className="text-[#101828] text-lg font-bold">
              {selectedLesson?.title || course.title}
            </h2>
            {(course.author || course.teacherName) && (
              <p className="text-[#667085] text-sm mt-1">
                بإشراف الأستاذ {course.author || course.teacherName}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl border border-[#D6E5F2] bg-[#EAF5FF] shadow-sm">
          <div className="px-5 py-4 border-b border-[#D6E5F2]">
            <h3 className="text-[#0E2A46] font-extrabold text-lg">
              محتوى الدروس
            </h3>
            {chapters.length > 0 && (
              <p className="text-[#667085] text-xs mt-1">
                {chapters.length} فصل • {chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0)} درس
              </p>
            )}
          </div>

          <div className="py-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {chapters.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm font-medium">لا يوجد محتوى متاح حالياً</p>
                <p className="text-gray-400 text-xs mt-1">سيتم إضافة الدروس قريباً</p>
              </div>
            ) : (
              chapters.map(chapter => {
                const isOpen = openChapters.has(chapter.id);
                return (
                  <div key={chapter.id} className="px-3 mb-2">
                    {/* Chapter Header */}
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-md border bg-white/60 hover:bg-white transition"
                    >
                      <span
                        className={`text-[#0E2A46] transition-transform text-xs ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </span>
                      <div className="flex-1 text-right">
                        <div className="text-[#0E2A46] text-sm font-bold">
                          {chapter.title}
                        </div>
                        {chapter.subTitle && (
                          <div className="text-[#2E73B7] text-xs font-semibold">
                            {chapter.subTitle}
                          </div>
                        )}
                        {chapter.lessons?.length > 0 && (
                          <div className="text-[#667085] text-xs mt-1">
                            {chapter.lessons.length} {chapter.lessons.length === 1 ? 'درس' : 'دروس'}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Lessons */}
                    {isOpen && (
                      <div className="mt-2 mb-1">
                        {/* Lessons List */}
                        <ul className="space-y-1.5">
                          {chapter.lessons?.length ? (
                            chapter.lessons.map((lesson, idx) => (
                              <li
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                                  selectedLesson?.id === lesson.id
                                    ? "bg-white border-[#54C5F8] shadow-sm"
                                    : "bg-white/50 hover:bg-white border-[#D6E5F2]"
                                }`}
                              >
                                <span className="text-[#54C5F8] text-xs">▶</span>
                                <div className="flex-1 text-right">
                                  <p className="text-[#0E2A46] text-sm font-semibold">
                                    الدرس {idx + 1}
                                  </p>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-3 text-sm text-gray-400 text-right bg-white/30 rounded-lg">
                              لا توجد دروس متاحة في هذا الفصل
                            </li>
                          )}
                        </ul>

                        {/* Quiz Section */}
                        <div className="mt-4 pt-3 border-t border-[#D6E5F2]">
                          <h4 className="text-xs font-semibold text-[#0E2A46] mb-2 text-right">
                            اختبارات الفصل ({chapter.quizzes?.length || 0})
                          </h4>
                          
                          {chapter.quizzes?.length > 0 ? (
                            <div className="space-y-1.5">
                              {chapter.quizzes.map((quiz, idx) => {
                                try {
                                  const hasQuestions = (quiz.questions?.length || 0) > 0;
                                  return (
                                    <button
                                      key={quiz?.id || idx}
                                      onClick={() => handleStartQuiz(quiz, chapter.title)}
                                      className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 transition text-right ${
                                        hasQuestions 
                                          ? "bg-gradient-to-r from-[#F0F5FF] to-[#EAF5FF] hover:from-[#E6F2FF] hover:to-[#D6E5F2] border-[#54C5F8]"
                                          : "bg-gray-100 border-gray-300 opacity-60"
                                      }`}
                                      disabled={!hasQuestions}
                                    >
                                      <svg className="w-4 h-4 text-[#54C5F8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <div className="flex-1">
                                        <p className="text-[#0E2A46] text-sm font-semibold">
                                          {quiz?.title || `اختبار ${idx + 1}`}
                                        </p>
                                        <p className="text-[#667085] text-xs">
                                          {hasQuestions ? `اضغط للبدء (${quiz.questions.length} أسئلة)` : 'لا توجد أسئلة متاحة'}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                } catch (quizErr) {
                                  return (
                                    <div key={idx} className="p-2 text-red-500 text-xs">
                                      خطأ في عرض الاختبار
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          ) : (
                            <div className="p-3 text-gray-500 text-sm text-center bg-gray-50 rounded">
                              لا توجد اختبارات متاحة في هذا الفصل
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </section>

      {/* Quiz Modal */}
      {showQuiz && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
          
            <Quiz quiz={selectedQuiz} onClose={handleCloseQuiz} chapterTitle={chapters.find(ch => ch.quizzes?.some(q=>q.id===selectedQuiz?.id))?.title} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Player;