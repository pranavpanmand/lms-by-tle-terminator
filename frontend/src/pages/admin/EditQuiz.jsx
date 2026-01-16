import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../App";
import AddQuiz from "./AddQuiz";

export default function EditQuiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    axios
      .put(serverUrl + "/api/quiz/" + quizId, { withCredentials: true })
      .then((r) => setQuiz(r.data));
  }, []);

  if (!quiz) return null;

  return <AddQuiz editData={quiz} />;
}
