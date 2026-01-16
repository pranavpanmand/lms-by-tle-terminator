import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../App";
import { toast } from "react-toastify";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

export default function AddQuiz({ editData }) {
  const { lectureId, courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState(editData?.quizTitle || "");
  const [questions, setQuestions] = useState(
    editData?.questions || [
      { questionText: "", options: ["", "", "", ""], correctOption: 0 },
    ]
  );

  // Load quiz when editing
  useEffect(() => {
    if (!quizId) return;
    axios
      .get(serverUrl + "/api/quizbyid/" + quizId, { withCredentials: true })
      .then((r) => {
        setQuizTitle(r.data.quizTitle);
        setQuestions(r.data.questions);
      });
  }, [quizId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctOption: 0 },
    ]);
  };

  const saveQuiz = async () => {
    try {
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
      }));
      console.log(formattedQuestions);

      if (quizId) {
        await axios.put(
          serverUrl + `/api/quiz/${quizId}`,
          { quizTitle, questions: formattedQuestions },
          { withCredentials: true }
        );
        toast.success("Quiz Updated");
      } else {
        await axios.post(
          serverUrl + "/api/quiz",
          {
            quizTitle,
            lectureId,
            courseId,
            questions: formattedQuestions,
          },
          { withCredentials: true }
        );
        toast.success("Quiz Created");
      }

      navigate(`/editlecture/${courseId}/${lectureId}`);
    } catch (e) {
      console.log("Error saving quiz:", e);
      console.log(e.response?.data);
      toast.error("Quiz Save Failed");
    }
  };

  const deleteQuiz = async () => {
    if (!quizId) return;
    if (!window.confirm("Delete this quiz permanently?")) return;

    await axios.delete(serverUrl + `/api/quiz/${quizId}`, {
      withCredentials: true,
    });
    toast.success("Quiz Deleted");
    navigate(`/editlecture/${courseId}/${lectureId}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600"
        >
          <FaArrowLeft /> Back
        </button>

        {quizId && (
          <button
            onClick={deleteQuiz}
            className="flex items-center gap-2 text-red-600 font-semibold"
          >
            <FaTrash /> Delete Quiz
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {quizId ? "Edit Quiz" : "Create Quiz"}
      </h2>

      <input
        className="w-full border p-3 rounded mb-4"
        placeholder="Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {questions.map((q, i) => (
        <div key={i} className="border p-4 mb-4 rounded-lg bg-gray-50">
          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder={`Question ${i + 1}`}
            value={q.questionText}
            onChange={(e) => {
              const c = [...questions];
              c[i].questionText = e.target.value;
              setQuestions(c);
            }}
          />

          {q.options.map((op, oi) => (
            <div key={oi} className="flex gap-2 mb-2">
              <input
                type="radio"
                checked={q.correctOption === oi}
                onChange={() => {
                  const c = [...questions];
                  c[i].correctOption = oi;
                  setQuestions(c);
                }}
              />
              <input
                className="border p-2 w-full rounded"
                placeholder={`Option ${oi + 1}`}
                value={op}
                onChange={(e) => {
                  const c = [...questions];
                  c[i].options[oi] = e.target.value;
                  setQuestions(c);
                }}
              />
            </div>
          ))}

          <button
            onClick={() => setQuestions(questions.filter((_, x) => x !== i))}
            className="text-red-500 text-sm mt-2"
          >
            Delete Question
          </button>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        + Add Question
      </button>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="border px-6 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={saveQuiz}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Save Quiz
        </button>
      </div>
    </div>
  );
}
