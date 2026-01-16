import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  createQuiz,
  getQuizByLecture,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

const quizRouter = express.Router();

// TEMP: everyone logged-in can manage quiz
quizRouter.post("/", isAuth, createQuiz);
quizRouter.put("/:quizId", isAuth, updateQuiz);
quizRouter.delete("/:quizId", isAuth, deleteQuiz);
quizRouter.get("/:lectureId", isAuth, getQuizByLecture);

export default quizRouter;
