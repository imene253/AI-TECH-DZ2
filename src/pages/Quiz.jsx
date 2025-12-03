import React, { useEffect, useState } from 'react';
import { api } from "../api/client";

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [questions, setQuestions] = useState([
    { qstn: '', answers: [{ answr: '', isCorrect: false }, { answr: '', isCorrect: false }] }
  ]);

  useEffect(() => {
    loadQuizzes();
    loadChapters();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/Quiz');
      const quizzesArray = Array.isArray(data) ? data : [];
      const sortedQuizzes = quizzesArray.sort((a, b) => (a.chapterId || 0) - (b.chapterId || 0));
      setQuizzes(sortedQuizzes);
    } catch (e) {
      setError(e?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      const data = await api.get('/api/Chapter');
      setChapters(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load chapters');
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { 
      qstn: '', 
      answers: [{ answr: '', isCorrect: false }, { answr: '', isCorrect: false }] 
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateQuestionText = (index, value) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, qstn: value } : q
    ));
  };

  const addAnswer = (questionIndex) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { ...q, answers: [...q.answers, { answr: '', isCorrect: false }] }
        : q
    ));
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex && q.answers.length > 1
        ? { ...q, answers: q.answers.filter((_, ai) => ai !== answerIndex) }
        : q
    ));
  };

  const updateAnswer = (questionIndex, answerIndex, field, value) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? {
            ...q,
            answers: q.answers.map((a, ai) => 
              ai === answerIndex ? { ...a, [field]: value } : a
            )
          }
        : q
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedChapter === 0) {
        setError('Please select a chapter');
        setLoading(false);
        return;
      }

      const validQuestions = questions
        .filter(q => q.qstn.trim() !== '')
        .map(q => ({
          qstn: q.qstn.trim(),
          answers: q.answers.filter(a => a.answr.trim() !== '')
        }))
        .filter(q => q.answers.length > 0);

      if (validQuestions.length === 0) {
        setError('Please add at least one question with answers');
        setLoading(false);
        return;
      }

      for (let q of validQuestions) {
        if (!q.answers.some(a => a.isCorrect)) {
          setError('Each question must have at least one correct answer');
          setLoading(false);
          return;
        }
      }

      const payload = {
        chapterId: selectedChapter,
        questions: validQuestions
      };

      const response = await api.post('/api/Quiz/AddQuizToChapter', payload);

      setSelectedChapter(0);
      setQuestions([
        { qstn: '', answers: [{ answr: '', isCorrect: false }, { answr: '', isCorrect: false }] }
      ]);
      setError('');

      const chapterName = getChapterName(selectedChapter);
      alert(`Quiz created successfully `);
      await loadQuizzes();
    } catch (e) {
      setError(e?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/Quiz/DeleteQuiz/${id}`);
      alert('Quiz deleted!');
      await loadQuizzes();
    } catch (e) {
      setError(e?.message || 'Failed to delete quiz');
    } finally {
      setLoading(false);
    }
  };

  const getChapterName = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter?.title || `Chapter ${chapterId}`;
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6">Quiz Management</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 md:mb-5 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 md:mb-5">Create New Quiz</h2>

          <div className="mb-4 md:mb-5">
            <label className="block font-medium mb-2 text-xs sm:text-sm md:text-base">
              Select Chapter *
            </label>
            <select 
              value={selectedChapter} 
              onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
              className="w-full px-3 py-3 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm sm:text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={0}>-- Choose Chapter --</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-5 md:mb-6">
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 mb-3 md:mb-4">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="w-full xs:w-auto bg-green-500 hover:bg-green-600 active:bg-green-700 text-blue px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 bg-gray-50">
                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 mb-3 md:mb-4">
                    <h4 className="text-xs sm:text-sm md:text-base font-semibold">Question {qIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="w-full xs:w-auto text-red-500 hover:text-red-700 active:text-red-800 text-sm font-medium transition-colors text-left xs:text-right"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <textarea
                    value={question.qstn}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-3 py-3 sm:py-3 md:py-3.5 border border-gray-300 rounded-lg text-sm sm:text-sm md:text-base resize-y min-h-[100px] sm:min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <div className="mt-3 md:mt-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs sm:text-sm md:text-sm font-medium">Answers ({question.answers.length})</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => addAnswer(qIndex)}
                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-blue px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        + Add Answer
                      </button>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      {question.answers.map((answer, aIndex) => (
                        <div key={aIndex} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-3 md:p-4">
                          <div className="space-y-2.5 sm:space-y-3">
                            <input
                              type="text"
                              value={answer.answr}
                              onChange={(e) => updateAnswer(qIndex, aIndex, 'answr', e.target.value)}
                              placeholder="Answer text..."
                              className="w-full px-3 py-3 sm:py-2.5 md:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-sm md:text-base min-h-[48px] sm:min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="flex items-center justify-between gap-3">
                              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                                <input
                                  type="checkbox"
                                  checked={answer.isCorrect}
                                  onChange={(e) => updateAnswer(qIndex, aIndex, 'isCorrect', e.target.checked)}
                                  className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="select-none font-medium">Correct</span>
                              </label>
                              {question.answers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeAnswer(qIndex, aIndex)}
                                  className="text-red-500 hover:text-red-700 active:text-red-800 text-xl sm:text-lg font-bold px-2 transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full xs:w-auto bg-sky-400 hover:bg-sky-500 active:bg-sky-600 disabled:bg-gray-400 text-white px-6 py-3 sm:py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedChapter(0);
                setQuestions([{ qstn: '', answers: [{ answr: '', isCorrect: false }, { answr: '', isCorrect: false }] }]);
                setError('');
              }}
              className="w-full xs:w-auto bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white px-6 py-3 sm:py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 mb-4 md:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold">All Quizzes ({quizzes.length})</h2>
            <button
              onClick={loadQuizzes}
              className="w-full xs:w-auto text-sky-400 hover:text-sky-600 active:text-sky-700 font-medium text-sm md:text-base transition-colors text-left xs:text-right"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="text-center text-gray-500 py-6 sm:py-8 text-sm">Loading...</p>
          )}

          {!loading && quizzes.length === 0 && (
            <p className="text-center text-gray-500 py-8 sm:py-12 text-sm">
              No quizzes yet. Create one above!
            </p>
          )}

          {!loading && quizzes.length > 0 && (
            <div className="space-y-4 md:space-y-6">
              {chapters.map(chapter => {
                const chapterQuizzes = quizzes.filter(q => q.chapterId === chapter.id);
                if (chapterQuizzes.length === 0) return null;
                return (
                  <div key={chapter.id}>
                    <div className="bg-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-2 md:mb-3 font-semibold text-xs sm:text-sm md:text-base text-gray-800">
                      📚 {chapter.title} ({chapterQuizzes.length} quiz{chapterQuizzes.length !== 1 ? 'zes' : ''})
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      {chapterQuizzes.map((quiz, idx) => (
                        <div key={quiz.id || idx} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 p-3 sm:p-3 md:p-4 bg-gray-50">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                              <span className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base">Quiz #{idx + 1}</span>
                              <span className="text-gray-500 text-xs sm:text-xs md:text-sm">ID: {quiz.id}</span>
                            </div>
                            <button
                              onClick={() => handleDelete(quiz.id)}
                              className="w-full xs:w-auto text-red-500 hover:text-white hover:bg-red-500 active:bg-red-600 border border-red-500 px-3 py-2 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-xs md:text-sm font-medium transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;