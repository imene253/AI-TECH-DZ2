import React, { useState, useEffect } from 'react';
import { quizApi, api } from '../api/client';

const Quiz = ({ quiz, onClose, chapterTitle }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({}); 
  const [revealed, setRevealed] = useState({}); 
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      if (!quiz?.id) return;
      setLoading(true);
      setError(null);

     
      let uid = null;
      try {
        const me = await api.get('/api/Authentification/GetMe').catch(() => null);
        uid = Number(me?.id ?? me?.userId ?? me?.UserId ?? me?.Id ?? null);
        if (Number.isFinite(uid)) setUserId(uid);
      } catch (e) {
        uid = null;
        setUserId(null);
      }

      try {
        const data = await quizApi.getById(quiz.id);
        const qs = data?.questions || data?.question || quiz.questions || [];
        const questionsArray = Array.isArray(qs) ? qs : [];
        setQuestions(questionsArray);

       
        if (uid) {
          await loadUserAnswers(questionsArray, uid);
        }
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        setError('فشل في تحميل أسئلة الاختبار');
      } finally {
        setLoading(false);
      }
    })();
  }, [quiz?.id]);

 
  const loadUserAnswers = async (questionsArray, uid) => {
    try {
      for (const q of questionsArray) {
        const qid = q?.id ?? q?.questionId ?? q?.QuestionId;
        if (!qid) continue;
        try {
          const res = await api.get(`/api/UserQuizAnswer/question/${qid}/user/${uid}`).catch(() => null);
          
          const record = Array.isArray(res) ? res[0] : res;
          if (record && (record.answerId || record.answerId === 0 || record.answerId === '0')) {
            const aid = String(record.answerId || record.answerId === 0 ? record.answerId : record.answer_Id || record.answerID);
            setSelected(prev => ({ ...prev, [String(qid)]: aid }));
            setRevealed(prev => ({ ...prev, [String(qid)]: true }));
          }
        } catch (e) {
          console.warn('Failed to load saved answer for question', qid, e);
        }
      }
    } catch (e) {
      console.error('Error loading user answers:', e);
    }
  };

  const handleSelect = async (question, answer) => {
  
    const qid = String(question?.id ?? question?.questionId ?? question?.QuestionId ?? question?.Id ?? '');
    const aid = String(answer?.id ?? answer?.answerId ?? answer?.AnswerId ?? '');

    if (!qid || !aid) {
      console.warn('Missing ids on question/answer', { question, answer });
      return;
    }

  
    if (revealed[qid]) return;

   

    
    setSelected(prev => ({ ...prev, [qid]: aid }));

   
    let uid = userId;
    if (!uid) {
      try {
        const me = await api.get('/api/Authentification/GetMe').catch(() => null);
        uid = Number(me?.id ?? me?.userId ?? me?.UserId ?? me?.Id ?? null);
        if (Number.isFinite(uid)) setUserId(uid);
      } catch (e) {
        uid = null;
      }
    }

    if (!uid) {
      
      setRevealed(prev => ({ ...prev, [qid]: true }));
      alert('الرجاء تسجيل الدخول لحفظ إجابتك');
      return;
    }

   
    try {
      const payload = { userId: uid, answerId: Number(aid), questionId: Number(qid) };
      const resp = await api.post('/api/UserQuizAnswer', payload);
    
     
      setRevealed(prev => ({ ...prev, [qid]: true }));
    } catch (e) {
      console.error('Failed to save user answer:', e);
     
      setRevealed(prev => ({ ...prev, [qid]: true }));
      alert('فشل في حفظ إجابتك. حاول مرة أخرى.');
    }
  };

  if (loading) return <div className="p-4">Loading quiz...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!questions.length) return <div className="p-4">لا توجد أسئلة متاحة</div>;

  return (
    <div className="text-right" onClickCapture={(e) => console.log('Quiz click capture target:', e.target)}>
     
     
      

      {questions.map((q, qi) => {
        const qid = String(q?.id ?? q?.questionId ?? q?.QuestionId ?? q?.Id ?? qi);
        return (
          <div key={qid} className="mb-4">
            <div className="font-medium mb-2">{`سؤال ${qi + 1}: `}{q.qstn}</div>
            <div className="space-y-2">
              {(q.answers || q.answer || []).map((a, aIdx) => {
               
                const aid = String(a?.id ?? a?.answerId ?? a?.AnswerId ?? aIdx);
                const isRevealed = !!revealed[qid];
                const isCorrect = Boolean(a?.isCorrect ?? a?.IsCorrect ?? a?.correct ?? a?.is_correct ?? a?.Correct);
                const isSelected = selected[qid] === aid;
                const showCorrectGreen = isRevealed && isCorrect;
                const showIncorrectRed = isRevealed && !isCorrect && isSelected;

               
                const backgroundColor = showCorrectGreen ? '#d1fae5' : (showIncorrectRed ? '#fee2e2' : (isSelected ? '#eef2ff' : '#ffffff'));
                const borderColor = showCorrectGreen ? '#34d399' : (showIncorrectRed ? '#f87171' : (isSelected ? '#60a5fa' : '#e5e7eb'));
                const textColor = showIncorrectRed ? '#991b1b' : '#0f172a';

                return (
                  <button
                    key={aid}
                    type="button"
                    onMouseDown={(e) => { console.log('onMouseDown', { qid, aid }); }}
                    onClick={() => { console.log('onClick button', { qid, aid }); handleSelect(q, a); }}
                    disabled={!!revealed[qid]}
                    className={`w-full text-right p-3 rounded-md`}
                    style={{
                      display: 'block',
                      pointerEvents: 'auto',
                      backgroundColor: backgroundColor,
                      border: `1px solid ${borderColor}`,
                      padding: '12px',
                      borderRadius: '6px',
                      textAlign: 'right',
                      color: textColor
                    }}
                  >
                    <span className="inline-block w-4 h-4 mr-3 align-middle" />
                    <span>{a.answr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {onClose && (
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">إغلاق</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
