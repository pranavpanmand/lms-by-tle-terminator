import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../App";
import { toast } from "react-toastify";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

export default function AddQuiz({ editData }) {
  const { lectureId, courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctOption: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState(10);

  // Sync edit data when loaded
  useEffect(() => {
    if (!editData) return;

    setQuizTitle(editData.quizTitle || "");
    setDuration(editData.duration || 10);
    setQuestions(
      editData.questions?.length
        ? editData.questions
        : [{ questionText: "", options: ["", "", "", ""], correctOption: 0 }]
    );
  }, [editData]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctOption: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error("At least one question is required");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    for (const q of questions) {
      if (!q.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error("All options must be filled");
        return;
      }
    }

    try {
      setSaving(true);

      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
      }));

      if (quizId) {
        await axios.put(
          `${serverUrl}/api/quiz/${quizId}`,
          { quizTitle,duration, questions: formattedQuestions },
          { withCredentials: true }
        );
        toast.success("Quiz Updated");
      } else {
        await axios.post(
          `${serverUrl}/api/quiz`,
          {
            quizTitle,
            lectureId,
            courseId,
            duration,
            questions: formattedQuestions,
          },
          { withCredentials: true }
        );
        toast.success("Quiz Created");
      }

      navigate(`/editlecture/${courseId}/${lectureId}`);
    } catch (error) {
      console.error(error);
      toast.error("Quiz Save Failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async () => {
    if (!quizId) return;
    if (!window.confirm("Delete this quiz permanently?")) return;

    try {
      await axios.delete(`${serverUrl}/api/quiz/${quizId}`, {
        withCredentials: true,
      });
      toast.success("Quiz Deleted");
      navigate(`/editlecture/${courseId}/${lectureId}`);
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black">
          <FaArrowLeft /> Back
        </button>

        {quizId && (
          <button
            onClick={deleteQuiz}
            className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-700">
            <FaTrash /> Delete Quiz
          </button>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800">
          {quizId ? "Edit Quiz" : "Create Quiz"}
        </h2>

        {/* Duration */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-600">
            Duration
          </label>

          <div className="relative">
            <input
              type="number"
              min={1}
              className="w-28 border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-semibold"
              placeholder="Minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              min
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Title */}
      <input
        className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
        placeholder="Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={i} className="border p-4 mb-4 rounded-lg bg-gray-50">
          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder={`Question ${i + 1}`}
            value={q.questionText}
            onChange={(e) => {
              const copy = [...questions];
              copy[i].questionText = e.target.value;
              setQuestions(copy);
            }}
          />

          {q.options.map((op, oi) => (
            <div key={oi} className="flex gap-2 mb-2 items-center">
              <input
                type="radio"
                name={`correct-${i}`}
                checked={q.correctOption === oi}
                onChange={() => {
                  const copy = [...questions];
                  copy[i].correctOption = oi;
                  setQuestions(copy);
                }}
              />
              <input
                className="border p-2 w-full rounded"
                placeholder={`Option ${oi + 1}`}
                value={op}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[i].options[oi] = e.target.value;
                  setQuestions(copy);
                }}
              />
            </div>
          ))}

          <button
            onClick={() => removeQuestion(i)}
            className="text-red-500 text-sm mt-2 hover:underline">
            Delete Question
          </button>
        </div>
      ))}

      {/* Actions */}
      <button
        onClick={addQuestion}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        + Add Question
      </button>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="border px-6 py-2 rounded">
          Cancel
        </button>
        <button
          onClick={saveQuiz}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50">
          {saving ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
