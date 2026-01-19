import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRedo,
  FaClipboardList,
  FaHistory,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import QuizTimer from "./QuizTimer";

/**
 * QuizView
 * - Adds a QuizTimer that auto-submits (force) when time expires.
 * - Adds per-question Correct vs Incorrect mini Pie chart in Detailed Analysis
 *
 * Expected behavior:
 * - If a previous attempt exists -> result is shown (read-only) and no timer runs
 * - If no previous attempt -> timer starts when quiz is loaded and auto-submits when expired
 */

function QuizView({ quiz, userId }) {
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingHistory, setCheckingHistory] = useState(true);

  // Prevent double submit via timer + manual
  const submittingRef = useRef(false);

  // Reset on quiz change
  useEffect(() => {
    if (!quiz?._id) return;
    setResponses({});
    setResult(null);
    submittingRef.current = false;
    checkPreviousAttempt();
  }, [quiz?._id]);

  // Fetch previous attempt (if any)
  const checkPreviousAttempt = async () => {
    if (!userId || !quiz?._id) {
      setCheckingHistory(false);
      return;
    }

    setCheckingHistory(true);
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/quiz/${quiz._id}/attempt`,
        { withCredentials: true },
      );

      if (data.success && data.attempt) {
        setResult(data.attempt);

        const historyResponses = {};
        if (data.attempt.responses) {
          data.attempt.responses.forEach((r) => {
            historyResponses[r.questionId] = r.selectedOption;
          });
        }
        setResponses(historyResponses);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("History check failed", error);
      }
    } finally {
      setCheckingHistory(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
        <FaClipboardList className="text-6xl mb-4 opacity-20" />
        <h3 className="text-lg font-semibold text-gray-600">
          No Quiz Selected
        </h3>
      </div>
    );
  }
  console.log(quiz)

  const handleOptionSelect = (questionId, optionIndex) => {
    if (result) return; 
    setResponses((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async (force = false) => {
    if (submittingRef.current) return;
    const questionCount = quiz.questions?.length || 0;

    if (!force && Object.keys(responses).length < questionCount) {
      toast.warn("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);
    submittingRef.current = true;
    try {
      const formattedResponses = (quiz.questions || []).map((q) => ({
        questionId: q._id,
        selectedOption:
          responses.hasOwnProperty(q._id) && responses[q._id] !== undefined
            ? responses[q._id]
            : null,
      }));

      const { data } = await axios.post(
        `${serverUrl}/api/quiz/${quiz._id}/submit`,
        { responses: formattedResponses },
        { withCredentials: true },
      );

      if (data.success) {
        setResult({
          ...data.data,
          responses: formattedResponses,
        });
        toast.success("Quiz Submitted!");
      } else {
        toast.error(data.message || "Submission failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Submission failed");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // --- RENDER LOADING HISTORY ---
  if (checkingHistory) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Checking previous attempts...</p>
      </div>
    );
  }

  // --- RESULT VIEW (Analysis) with per-question stats Pie ---
  if (result) {
    const pieData = [
      { name: "Correct", value: result.score || 0 },
      {
        name: "Incorrect",
        value: (result.totalQuestions || 0) - (result.score || 0),
      },
    ];
    const COLORS = ["#10B981", "#EF4444"];

    return (
      <div className="flex flex-col gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Quiz Results
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-6">
            <div style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-left">
              <p className="text-4xl font-extrabold text-indigo-600">
                {Math.round(
                  ((result.score || 0) / (result.totalQuestions || 1)) * 100,
                )}
                %
              </p>
              <p className="text-gray-500">
                Score: {result.score} / {result.totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setResult(null);
                setResponses({});
              }}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition font-medium border border-indigo-100">
              <FaRedo /> Retake Quiz
            </button>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FaHistory className="text-gray-400" /> Detailed Analysis
          </h3>

          <div className="space-y-6">
            {(quiz.questions || []).map((q, index) => {
              const userAns =
                result.responses && Array.isArray(result.responses)
                  ? result.responses.find((r) => r.questionId === q._id)
                      ?.selectedOption
                  : responses[q._id];

              const isCorrect = userAns === q.correctOption;

              let correctCount = q.correctCount;
              let attemptCount = q.attemptCount;

              const incorrectCount =
                attemptCount != null && correctCount != null
                  ? Math.max(0, attemptCount - correctCount)
                  : null;

              const miniPie =
                correctCount != null && attemptCount != null && attemptCount > 0
                  ? [
                      { name: "Correct", value: correctCount },
                      { name: "Incorrect", value: incorrectCount },
                    ]
                  : null;

              return (
                <div
                  key={q._id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? "border-green-100 bg-green-50/50"
                      : "border-red-100 bg-red-50/50"
                  }`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-3">
                        {index + 1}. {q.questionText}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options?.map((opt, i) => {
                          let optClass =
                            "relative p-3 rounded-lg text-sm border flex justify-between items-center transition-all ";

                          if (i === q.correctOption) {
                            optClass +=
                              "bg-green-100 border-green-300 font-medium text-green-900";
                          } else if (i === userAns && !isCorrect) {
                            optClass +=
                              "bg-red-100 border-red-300 text-red-900";
                          } else {
                            optClass +=
                              "bg-white border-gray-200 text-gray-500 opacity-80";
                          }

                          return (
                            <div key={i} className={optClass}>
                              <span>{opt}</span>

                              <div className="flex items-center gap-2">
                                {i === userAns && (
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/10">
                                    You
                                  </span>
                                )}

                                {i === q.correctOption && (
                                  <FaCheckCircle className="text-green-600 text-lg" />
                                )}
                                {i === userAns && !isCorrect && (
                                  <FaTimesCircle className="text-red-600 text-lg" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        {q.explanation && (
                          <div className="mt-3 p-3 bg-gray-50 border-l-4 border-indigo-500 text-gray-700 text-sm rounded">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right column: small stats chart if available */}
                    <div className="w-full md:w-44 flex flex-col items-center justify-center gap-2">
                      {miniPie ? (
                        <div className="w-36 h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={miniPie}
                                innerRadius={20}
                                outerRadius={30}
                                dataKey="value"
                                paddingAngle={2}>
                                <Cell fill="#10B981" />
                                <Cell fill="#EF4444" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="text-xs text-gray-500 mt-1">
                            {(correctCount/attemptCount)*100} % correct rate
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic text-center px-2">
                          No attempt stats available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ TAKING VIEW (no result yet) ---
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{quiz.quizTitle}</h2>
          <div className="flex items-center gap-3 text-gray-500 mt-2">
            <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <FaClipboardList /> {quiz.questions?.length || 0} Qs
            </div>
            <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <FaClock /> {quiz.duration} Mins
            </div>
          </div>
        </div>

        {/* Timer: starts only if result is null */}
        <div className="ml-auto">
          <QuizTimer
            durationMinutes={quiz.duration || 0}
            onExpire={() => {
              toast.info("Time is up — auto-submitting answers");
              handleSubmit(true); // force submit
            }}
          />
        </div>
      </div>

      <div className="space-y-8">
        {(quiz.questions || []).length > 0 ? (
          (quiz.questions || []).map((q, index) => (
            <div key={q._id}>
              <p className="font-semibold text-lg text-gray-800 mb-4">
                {index + 1}. {q.questionText}
              </p>
              <div className="space-y-2">
                {q.options?.map((option, i) => (
                  <label
                    key={i}
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                      responses[q._id] === i
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      className="w-4 h-4 text-indigo-600"
                      onChange={() => handleOptionSelect(q._id, i)}
                      checked={responses[q._id] === i}
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select a quiz to begin.
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading || (quiz.questions || []).length === 0}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}


export default QuizView;
