import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { FaVideo, FaPlayCircle, FaCalendarAlt, FaChalkboardTeacher } from "react-icons/fa";
import { motion } from "framer-motion";
import { format } from "date-fns"; // Run 'npm install date-fns' if needed, or use native Date

export default function LiveClassDashboard() {
  const [lectures, setLectures] = useState([]);
  const [tab, setTab] = useState("upcoming"); // 'upcoming' or 'past'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/live/all`, { withCredentials: true });
        if (data.success) {
          setLectures(data.lectures);
        }
      } catch (error) {
        console.error("Error fetching lectures", error);
      }
    };
    fetchLectures();
  }, []);

  // Filter Logic
  const upcomingLectures = lectures.filter(l => l.isActive === true);
  const pastLectures = lectures.filter(l => l.isActive === false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Live Class Schedule</h1>
            <p className="text-slate-500 mt-2">Join interactive sessions or watch recorded lectures.</p>
          </div>
          
          {/* TABS */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                tab === "upcoming" ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              🔴 Live & Upcoming
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                tab === "past" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              📼 Recordings
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tab === "upcoming" ? upcomingLectures : pastLectures).map((lecture) => (
            <motion.div 
              key={lecture._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Thumbnail Area */}
              <div className="h-40 bg-slate-900 relative">
                <img 
                   src={lecture.courseId?.thumbnail || "https://via.placeholder.com/400x200"} 
                   alt="" 
                   className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <FaChalkboardTeacher className="text-blue-600" />
                  {lecture.instructorId?.name || "Instructor"}
                </div>
                
                {tab === "upcoming" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <button 
                       onClick={() => navigate(`/live/${lecture.meetingId}`)}
                       className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg animate-pulse"
                     >
                        <FaVideo /> Join Now
                     </button>
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-6 space-y-4">
                <div>
                   <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{lecture.topic}</h3>
                   <p className="text-sm text-slate-500">{lecture.courseId?.title}</p>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                   <FaCalendarAlt className="text-slate-400" />
                   {new Date(lecture.startTime).toLocaleString()}
                </div>

                {tab === "past" && (
                  <button 
                    disabled={!lecture.recordingUrl}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        lecture.recordingUrl 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                     <FaPlayCircle /> 
                     {lecture.recordingUrl ? "Watch Recording" : "Processing..."}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {(tab === "upcoming" ? upcomingLectures : pastLectures).length === 0 && (
             <div className="col-span-full text-center py-20 text-slate-400">
                No {tab} lectures found.
             </div>
          )}
        </div>

      </div>
    </div>
  );
}