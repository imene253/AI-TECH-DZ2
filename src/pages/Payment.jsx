import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getCourseById } from '../data/courses';
import { useAppContext } from '../context/AppContext';
import { api } from '../api/client';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addCourse } = useAppContext();
  const [course, setCourse] = useState(() => getCourseById(id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fileInputRef = useRef(null);
  const snackbarTimerRef = useRef(null);

  
  const handleSnackbar = (message, { error = false } = {}) => {
    setSnackbarMessage(message);
    setIsError(error);
    setShowSnackbar(true);

    // Timer
    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
    snackbarTimerRef.current = setTimeout(() => {
      setShowSnackbar(false);
      snackbarTimerRef.current = null;
    }, 4000);
  };

 
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (course) return; 
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/api/Courses/${id}`);
        if (mounted) setCourse(data || null);
      } catch (e) {
        if (mounted) setError(e?.message || 'فشل في تحميل الدورة');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // cleanup 
  useEffect(() => {
    return () => {
      if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    };
  }, []);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFile(event.target.files[0]);
      handleSnackbar("تم إرفاق إثبات الدفع بنجاح ", { error: false });
    }
  };

  const handleConfirm = async () => {
  
    if (isSubmitting) {
      handleSnackbar("تم النقر بالفعل، يرجى الانتظار...", { error: true });
      return;
    }
    
    if (hasSubmitted) {
      handleSnackbar("تم إرسال طلبك بالفعل.", { error: true });
      return;
    }

    // Check authentication
    const token = (() => { try { return localStorage.getItem('auth_token'); } catch { return null; } })();
    if (!token) {
      handleSnackbar("يرجى تسجيل الدخول أولاً.", { error: true });
      return;
    }

    if (!uploadedFile) {
      handleSnackbar("الرجاء إرفاق إثبات الدفع أولاً.", { error: true });
      return;
    }
    
    try {
      setIsSubmitting(true);
      handleSnackbar("جاري إرسال طلبك...", { error: false });
     
      // Get user ID
      let userId = 0;
      try {
        const me = await api.get('/api/Authentification/GetMe');
        const possibleId = me?.id || me?.userId || me?.UserId || me?.Id;
        if (possibleId) userId = Number(possibleId);
      } catch {}

      const numericCourseId = Number(course?.id ?? id);

      
      const formData = new FormData();
      formData.append('File', uploadedFile); 
      formData.append('UserId', userId.toString());
      formData.append('CourseId', numericCourseId.toString());

      await api.post('/api/PaymentFille', formData);

      handleSnackbar("تم استلام طلب الدفع، سيتم تفعيل الدورة في قسم دروسي بعد التحقق.", { error: false });
      setHasSubmitted(true);
     
    } catch (e) {
      const apiMessage = e?.data?.message || e?.data?.error || e?.data?.title || e?.message;
      handleSnackbar(apiMessage || 'فشل إرسال عملية الدفع', { error: true });
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-6 py-24 text-center">
          <div className="text-gray-500">جاري التحميل…</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-6 py-24 text-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0E2A46] mb-4">{error || 'الدورة غير موجودة'}</h1>
            <Link className="text-[#54C5F8] font-semibold" to="/courses">العودة إلى جميع الدورات</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Header  */}
      <div className="w-full bg-[#20B486]">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 md:px-10 lg:px-16 py-4">
          <h1 className="text-white text-xl md:text-2xl font-bold text-right"> الدفع </h1>
        </div>
      </div>

      {/* card */}
      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto w-[92%] md:w-[82%] py-8 md:py-12">
          <div className="bg-white rounded-[20px] shadow-[0_18.83px_47.08px_rgba(47,50,125,0.10)] border border-[#CBD0DC]/60">

            {/* Upload section */}
            <div className="relative border-4 border-dashed border-[#CBD0DC] rounded-[40px] m-6 md:m-10 p-8 md:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6">
                <span className="text-[#292D32] text-4xl">☁️</span>
              </div>
              <p className="text-[#292D32] text-xl md:text-2xl font-medium mb-2"> وسيلة الدفع</p>
              <p className="text-[#A9ACB4] text-base md:text-lg"> أرفق إثبات الدفع </p>

              {/* file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.pdf"
                onChange={handleFileSelect}
              />

              {/* file picker */}
              <button 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="mt-8 px-10 py-4 rounded-2xl border border-[#CBD0DC] text-[#54575C] font-medium hover:bg-gray-50"
              >
                متابعة
              </button>

              {uploadedFile && (
                <p className="mt-4 text-sm text-green-600">
                 {uploadedFile.name} تم رفع الملف
                </p>
              )}
            </div>

          

            {/* Confirm button */}
            <div className="flex justify-center pb-10">
              <button 
                onClick={handleConfirm} 
                disabled={isSubmitting || hasSubmitted}
                className={`px-12 py-4 rounded-2xl font-semibold transition text-white ${
                  isSubmitting || hasSubmitted ? 'bg-[#93c5aa] cursor-not-allowed' : 'bg-[#20B486] hover:bg-[#1A906B]'
                }`}
              >
                تأكيد الدفع
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Snackbar*/}
      {showSnackbar && (
        <div className="fixed inset-x-0 bottom-6 sm:bottom-20 flex justify-center z-50 pointer-events-none">
          <div className="max-w-[1280px] w-[92%] md:w-[82%] px-4">
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

export default Payment;
