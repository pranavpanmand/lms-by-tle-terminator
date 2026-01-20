import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import { 
  FaVideo, 
  FaPlayCircle, 
  FaCalendarAlt, 
  FaChalkboardTeacher, 
  FaUserTie,
  FaSync,        // New Icon
  FaSpinner      // New Icon
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify"; // Import Toast

export default function LiveClassDashboard() {
  const [lectures, setLectures] = useState([]);
  const [tab, setTab] = useState("upcoming"); // 'upcoming' or 'past'
  const [syncingId, setSyncingId] = useState(null); // Track which ID is syncing
  const navigate = useNavigate();
  
  const { userData } = useSelector((state) => state.user);

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

  // === NEW: HANDLER TO SYNC RECORDING ===
  const handleSyncRecording = async (meetingId) => {
    setSyncingId(meetingId);
    try {
        const { data } = await axios.post(`${serverUrl}/api/live/sync`, { meetingId }, { withCredentials: true });
        
        if(data.success) {
            if(data.message.includes("Stream is still processing")) {
                 toast.info(data.message);
            } else {
                 toast.success(data.message);
                 // Update the local state immediately so button changes to "Watch"
                 setLectures(prev => prev.map(l => l.meetingId === meetingId ? { ...l, recordingUrl: data.url } : l));
            }
        } else {
            toast.info(data.message);
        }
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Sync Failed. Try again later.");
    } finally {
        setSyncingId(null);
    }
  };
  // ======================================

  const upcomingLectures = lectures.filter(l => l.isActive === true);
  const pastLectures = lectures.filter(l => l.isActive === false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Live Class Schedule
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {userData?.role === 'educator' 
                ? "Manage and start your scheduled sessions." 
                : "Join interactive sessions or watch recorded lectures."}
            </p>
          </div>
          
          {/* TABS */}
          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                tab === "upcoming" 
                ? "bg-slate-900 text-white shadow-md" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Live & Upcoming
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                tab === "past" 
                ? "bg-slate-900 text-white shadow-md" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Past Recordings
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(tab === "upcoming" ? upcomingLectures : pastLectures).map((lecture) => {
            
            const isMyLecture = userData?._id === lecture.instructorId?._id;

            return (
              <motion.div 
                key={lecture._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group bg-white rounded-3xl overflow-hidden transition-all duration-300
                  ${isMyLecture 
                    ? "border-2 border-indigo-500 shadow-xl shadow-indigo-100" 
                    : "border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  }
                `}
              >
                {/* Thumbnail Area */}
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  <img 
                     src={lecture.courseId?.thumbnail || "https://via.placeholder.com/400x200"} 
                     alt="" 
                     className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <FaUserTie className="text-indigo-600" />
                    {lecture.instructorId?.name || "Instructor"}
                  </div>

                  {isMyLecture && (
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-lg">
                      My Class
                    </div>
                  )}
                  
                  {/* JOIN BUTTON (Upcoming Only) */}
                  {tab === "upcoming" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                       <button 
                         onClick={() => navigate(`/live/${lecture.meetingId}`)}
                         className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl transform scale-95 group-hover:scale-100 transition-all
                           ${isMyLecture 
                             ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-600/30" 
                             : "bg-white hover:bg-indigo-50 text-slate-900"
                           }
                         `}
                       >
                          <FaVideo className={isMyLecture ? "animate-pulse" : ""} /> 
                          {isMyLecture ? "Start Live Class" : "Join Class"}
                       </button>
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div className="p-6 space-y-4">
                  <div>
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                          {lecture.courseId?.title || "Course"}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 leading-tight">{lecture.topic}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <FaCalendarAlt className="text-indigo-400" />
                     {new Date(lecture.startTime).toLocaleString([], {
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                     })}
                  </div>

                  {/* RECORDING / SYNC BUTTONS (Past Only) */}
                  {tab === "past" && (
                    <div className="w-full">
                        {lecture.recordingUrl ? (
                            <button 
                              onClick={() => window.open(lecture.recordingUrl, "_blank")}
                              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
                            >
                               <FaPlayCircle className="text-lg" /> Watch Recording
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <div className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold flex items-center justify-center gap-2 text-sm border border-slate-200 cursor-wait">
                                    Processing...
                                </div>
                                
                                {/* SYNC BUTTON FOR EDUCATORS */}
                                {userData?.role === 'educator' && (
                                     <button 
                                        onClick={() => handleSyncRecording(lecture.meetingId)}
                                        disabled={syncingId === lecture.meetingId}
                                        className="w-14 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center hover:bg-blue-100 hover:border-blue-200 hover:scale-105 transition-all shadow-sm"
                                        title="Force Sync Recording"
                                     >
                                        {syncingId === lecture.meetingId ? (
                                            <FaSpinner className="animate-spin text-lg" />
                                        ) : (
                                            <FaSync className="text-lg" />
                                        )}
                                     </button>
                                )}
                            </div>
                        )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {(tab === "upcoming" ? upcomingLectures : pastLectures).length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                <FaChalkboardTeacher className="text-4xl mb-4 text-slate-300" />
                <p>No {tab} lectures found.</p>
                {userData?.role === 'educator' && tab === 'upcoming' && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 text-indigo-600 font-bold hover:underline"
                  >
                    Go to Dashboard to schedule one?
                  </button>
                )}
             </div>
          )}
        </div>

      </div>
    </div>
  );
}