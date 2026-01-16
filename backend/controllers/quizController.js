// import Quiz from "../models/Quiz.js";
// import Course from "../models/courseModel.js";

// /* ================= CREATE QUIZ ================= */
// export const createQuiz = async (req, res) => {
//   try {
//     const { quizTitle, courseId, lectureId, questions } = req.body;

//     if (!quizTitle || !courseId || !lectureId || !questions) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const lecture = course.lectures.find(
//       (l) => l._id.toString() === lectureId
//     );
//     if (!lecture)
//       return res
//         .status(404)
//         .json({ message: "Lecture not found in this course" });

//     const existingQuiz = await Quiz.findOne({ lectureId });
//     if (existingQuiz)
//       return res
//         .status(400)
//         .json({ message: "Quiz already exists for this lecture" });

//     const quiz = await Quiz.create({
//       quizTitle,
//       courseId,
//       lectureId,
//       questions,
//     });

//     res.status(201).json(quiz);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /* ================= GET QUIZ ================= */
// export const getQuizByLecture = async (req, res) => {
//   try {
//     const quiz = await Quiz.findOne({ lectureId: req.params.lectureId });
//     if (!quiz) return res.status(404).json({ message: "Quiz not found" });
//     res.json(quiz);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /* ================= UPDATE QUIZ ================= */
// export const updateQuiz = async (req, res) => {
//   try {
//     const quiz = await Quiz.findByIdAndUpdate(
//       req.params.quizId,
//       req.body,
//       { new: true }
//     );
//     if (!quiz) return res.status(404).json({ message: "Quiz not found" });
//     res.json(quiz);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /* ================= DELETE QUIZ ================= */
// export const deleteQuiz = async (req, res) => {
//   try {
//     await Quiz.findByIdAndDelete(req.params.quizId);
//     res.json({ message: "Quiz deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

import Quiz from "../models/Quiz.js";
import Course from "../models/courseModel.js";

/* ================= CREATE QUIZ ================= */
export const createQuiz = async (req, res) => {
  try {
    const { quizTitle, courseId, lectureId, questions } = req.body;

    if (!quizTitle || !courseId || !lectureId || !questions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lecture = course.lectures.find((l) => l._id.toString() === lectureId);
    if (!lecture)
      return res
        .status(404)
        .json({ message: "Lecture not found in this course" });

    const existingQuiz = await Quiz.findOne({ lectureId });
    if (existingQuiz)
      return res
        .status(400)
        .json({ message: "Quiz already exists for this lecture" });

    const quiz = await Quiz.create({
      quizTitle,
      courseId,
      lectureId,
      questions,
      createdBy: req.userId,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET QUIZ ================= */
export const getQuizByLecture = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lectureId: req.params.lectureId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE QUIZ ================= */
export const updateQuiz = async (req, res) => {
  try {
    const { questions, questionsTitle } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        quizTitle: questionsTitle,
        questions: questions,
      },
      {
        new: true,
      }
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE QUIZ ================= */
export const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.quizId);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
