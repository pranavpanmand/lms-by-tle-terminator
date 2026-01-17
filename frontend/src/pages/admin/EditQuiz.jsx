import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../App";
import AddQuiz from "./AddQuiz";

export default function EditQuiz() {
  const { lectureId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create mode → no quizId
    if (!quizId) {
      setLoading(false);
      return;
    }

    axios
      .get(`${serverUrl}/api/quiz/${lectureId}`, { withCredentials: true })
      .then((res) => setQuiz(res.data))
      .catch(() => setError("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return <AddQuiz editData={quiz} lectureId={lectureId} />;
}
