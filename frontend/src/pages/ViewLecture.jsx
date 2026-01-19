import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrophy } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import CourseSidebar from "../components/CourseSlidebar";
import LectureViewForUser from "../components/LectureView";
import QuizView from "../components/QuizView";



function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Active State
  const [activeTab, setActiveTab] = useState("lectures"); // 'lectures' or 'quizzes'
  const [activeUnit, setActiveUnit] = useState(null); // The specific lecture or quiz object

  // Fetch Course & Quiz Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Course & Lectures
        const courseRes = await axios.get(
          `${serverUrl}/api/course/getcourse/${courseId}`,
          { withCredentials: true },
        );
        setCourse(courseRes.data);
        setLectures(courseRes.data.lectures || []);

        // 2. Fetch Quizzes
        const quizRes = await axios.get(
          `${serverUrl}/api/quiz/course/${courseId}`,
          { withCredentials: true },
        );
        setQuizzes(quizRes.data.quizzes || []);

        // 3. Set Default Active Unit (First Lecture)
        if (courseRes.data.lectures?.length > 0) {
          setActiveUnit(courseRes.data.lectures[0]);
          setActiveTab("lectures");
        }
      } catch (error) {
        console.error("Error loading course:", error);
        toast.error("Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- Header --- */}
      <div className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/allcourses")}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
            {course?.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
            <FaTrophy className="text-yellow-500" />
            <span>{userData?.xp || 0} XP</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* --- Main Content Layout --- */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 md:p-6 gap-6">
        {/* LEFT COLUMN: Dynamic Content (Lecture or Quiz) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {activeTab === "lectures" && activeUnit ? (
            <LectureViewForUser
              lecture={activeUnit}
              lectures={lectures}
              courseCreator={course?.creator}
            />
          ) : activeTab === "quizzes" && activeUnit ? (
            <QuizView quiz={activeUnit} userId={userData?._id} />
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-500">
              Select an item from the sidebar to begin.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar List */}
        <div className="lg:w-[400px]">
          <CourseSidebar
            lectures={lectures}
            quizzes={quizzes}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeUnit={activeUnit}
            setActiveUnit={setActiveUnit}
            courseCreator={course?.creator}
          />
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;
