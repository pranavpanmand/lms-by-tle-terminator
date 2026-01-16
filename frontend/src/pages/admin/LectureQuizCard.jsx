import axios from "axios";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";

export default function LectureQuizCard({ lectureId }) {
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();
  const { courseId } = useParams();

  const loadQuiz = () => {
    axios
      .get(serverUrl + `/api/quiz/${lectureId}`, { withCredentials: true })
      .then((res) => setQuiz(res.data))
      .catch(() => setQuiz(null));
  };

  useEffect(loadQuiz, [lectureId]);

  if (!quiz) return null;

  return (
    <div className="mt-6 p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-indigo-50 shadow">
      <h3 className="font-bold text-lg text-indigo-700">📘 Lecture Quiz</h3>
      <p className="text-sm mt-1">{quiz.quizTitle}</p>

      <button
        onClick={() =>
          navigate(`/admin/edit-quiz/${quiz._id}/${lectureId}/${courseId}`)
        }
        className="mt-3 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm shadow transition"
      >
        <FaPen /> Edit Quiz
      </button>
    </div>
  );
}
