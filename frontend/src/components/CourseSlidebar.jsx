import React from "react";
import {
  FaPlayCircle,
  FaClipboardList,
  FaChalkboardTeacher,
} from "react-icons/fa";

function CourseSidebar({
  lectures,
  quizzes,
  activeTab,
  setActiveTab,
  activeUnit,
  setActiveUnit,
  courseCreator,
}) {
  return (
    <aside className="flex flex-col gap-6 sticky top-24">
      {/* Instructor Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-100">
            {courseCreator?.photoUrl ? (
              <img
                src={courseCreator.photoUrl}
                alt="Instructor"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {courseCreator?.name?.charAt(0) || "I"}
              </div>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow">
            <FaChalkboardTeacher size={10} />
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
            Instructor
          </p>
          <p className="font-extrabold text-gray-900">
            {courseCreator?.name || "Unknown"}
          </p>
        </div>
      </div>

      {/* Content Panel */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex-1 flex flex-col max-h-[calc(100vh-250px)]">
        {/* Tabs */}
        <div className="flex bg-gray-50 rounded-t-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab("lectures")}
            className={`flex-1 py-3 text-sm font-extrabold transition-all ${
              activeTab === "lectures"
                ? "text-indigo-600 bg-white shadow-inner"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Lectures
            <span className="ml-1 text-xs text-gray-400">
              ({lectures.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex-1 py-3 text-sm font-extrabold transition-all ${
              activeTab === "quizzes"
                ? "text-purple-600 bg-white shadow-inner"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Quizzes
            <span className="ml-1 text-xs text-gray-400">
              ({quizzes.length})
            </span>
          </button>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {activeTab === "lectures" ? (
            lectures.map((lecture, index) => {
              const isActive = activeUnit?._id === lecture._id;
              return (
                <div
                  key={lecture._id}
                  onClick={() => {
                    setActiveUnit(lecture);
                    window.dispatchEvent(
                      new CustomEvent("lectureSelected", { detail: lecture }),
                    );
                  }}
                  className={`group cursor-pointer rounded-xl border transition-all p-3 ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 border-transparent"
                  }`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold leading-snug line-clamp-2 ${
                          isActive ? "text-white" : "text-gray-900"
                        }`}>
                        {lecture.lectureTitle}
                      </p>
                    </div>
                    {isActive && (
                      <FaPlayCircle className="mt-1 text-white/80" />
                    )}
                  </div>
                </div>
              );
            })
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz, index) => {
              const isActive = activeUnit?._id === quiz._id;
              return (
                <button
                  key={quiz._id}
                  onClick={() => setActiveUnit(quiz)}
                  className={`w-full text-left rounded-xl transition-all p-3 flex items-start gap-3 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}>
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}>
                    Q{index + 1}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold line-clamp-2 ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}>
                      {quiz.quizTitle}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-purple-200" : "text-gray-400"
                      }`}>
                      {quiz.questions.length} Questions • {quiz.duration} Mins
                    </p>
                  </div>
                  {isActive && (
                    <FaClipboardList className="mt-1 text-white/80" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              No quizzes available for this course.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default CourseSidebar;
