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
  FaUpload,
  FaEdit,
  FaFileAlt,
  FaTrash,
  FaDownload,
  FaInfoCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function LiveClassDashboard() {
  const [lectures, setLectures] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [uploadingId, setUploadingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const navigate = useNavigate();
  
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    fetchLectures();
  }, []);

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

  const handleShowUploadModal = (lecture, isUpdate = false) => {
    setSelectedLecture({...lecture, isUpdate});
    setShowUploadModal(true);
  };

  const handleShowNotesModal = (lecture) => {
    setSelectedLecture(lecture);
    setShowNotesModal(true);
  };

  const handleFileSelect = (e, type = 'video') => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'video') {
        // Check file size (max 500MB)
        if (file.size > 500 * 1024 * 1024) {
          toast.error("File size too large. Maximum size is 500MB.");
          return;
        }
        
        // Check file type
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'];
        if (!validTypes.includes(file.type)) {
          toast.error("Invalid file type. Please upload MP4, MOV, AVI, or WMV.");
          return;
        }
        
        setVideoFile(file);
      } else {
        // For notes files
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'image/jpeg',
          'image/png',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!validTypes.includes(file.type)) {
          toast.error("Invalid file type. Please upload PDF, DOC, PPT, TXT, JPG, or PNG.");
          return;
        }
        
        // Check file size (max 50MB for notes)
        if (file.size > 50 * 1024 * 1024) {
          toast.error("File size too large. Maximum size is 50MB.");
          return;
        }
        
        setNotesFile(file);
      }
    }
  };

  const handleUploadRecording = async () => {
    if (!videoFile || !selectedLecture) {
      toast.error("Please select a video file");
      return;
    }

    setUploadingId(selectedLecture.meetingId);
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('meetingId', selectedLecture.meetingId);
    if (selectedLecture.isUpdate) {
      formData.append('isUpdate', 'true');
    }

    try {
      const endpoint = selectedLecture.isUpdate 
        ? `${serverUrl}/api/live/update-recording`
        : `${serverUrl}/api/live/upload-recording`;
      
      const { data } = await axios.post(
        endpoint,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success(data.message || "Recording uploaded successfully!");
        // Update lecture with new recording URL
        setLectures(prev => prev.map(l => l.meetingId === selectedLecture.meetingId ? 
          { ...l, recordingUrl: data.url } : l));
        setShowUploadModal(false);
        setVideoFile(null);
        setSelectedLecture(null);
        fetchLectures(); // Refresh data
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const handleUploadNotes = async () => {
    if (!notesFile || !selectedLecture) {
      toast.error("Please select a file");
      return;
    }

    setUploadingId(selectedLecture.meetingId);
    
    const formData = new FormData();
    formData.append('notes', notesFile);
    formData.append('meetingId', selectedLecture.meetingId);

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/live/upload-notes`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success("Notes uploaded successfully!");
        // Update lecture with new notes
        setLectures(prev => prev.map(l => l.meetingId === selectedLecture.meetingId ? 
          { ...l, notes: data.notes } : l));
        setShowNotesModal(false);
        setNotesFile(null);
        setSelectedLecture(null);
        fetchLectures(); // Refresh data
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDownloadNotes = async (lecture) => {
    try {
      // Use the backend download endpoint for proper file download
      const downloadUrl = `${serverUrl}/api/live/download-notes/${lecture.meetingId}`;
      
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Add authentication headers through URL params or use a different approach
      // For now, we'll open in a new tab which should handle cookies/auth
      window.open(downloadUrl, '_blank');
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
      
      // Fallback to direct URL
      if (lecture.notes && lecture.notes.url) {
        window.open(lecture.notes.url, '_blank');
      }
    }
  };

  const handleDeleteNotes = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete the notes?")) return;

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/live/delete-notes`,
        { meetingId },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Notes deleted successfully!");
        setLectures(prev => prev.map(l => l.meetingId === meetingId ? 
          { ...l, notes: null } : l));
        fetchLectures(); // Refresh data
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const upcomingLectures = lectures.filter(l => l.isActive === true);
  const pastLectures = lectures.filter(l => l.isActive === false);

  // Function to get file icon based on type
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FaFileAlt className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileAlt className="text-blue-500" />;
    if (['ppt', 'pptx'].includes(ext)) return <FaFileAlt className="text-orange-500" />;
    if (['xls', 'xlsx'].includes(ext)) return <FaFileAlt className="text-green-600" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FaFileAlt className="text-green-500" />;
    if (['txt'].includes(ext)) return <FaFileAlt className="text-gray-500" />;
    return <FaFileAlt />;
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      {/* Upload Recording Modal */}
      {showUploadModal && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedLecture.isUpdate ? "Update Lecture Recording" : "Upload Lecture Recording"}
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setVideoFile(null);
                  setSelectedLecture(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-semibold text-slate-900">{selectedLecture.topic}</p>
                <p className="text-sm text-slate-500">
                  {selectedLecture.courseId?.title || "Course"}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(selectedLecture.startTime).toLocaleDateString()}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {videoFile ? (
                  <div className="space-y-2">
                    <FaUpload className="text-4xl text-green-600 mx-auto" />
                    <p className="font-semibold">{videoFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(videoFile.size)}
                    </p>
                    <button
                      onClick={() => setVideoFile(null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <FaUpload className="text-4xl text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 mb-2">
                      {selectedLecture.isUpdate 
                        ? "Select new recording file to update" 
                        : "Select your recorded lecture video"}
                    </p>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                      onChange={(e) => handleFileSelect(e, 'video')}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800"
                    >
                      Choose Video
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      MP4, MOV, AVI, WMV (Max 500MB)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setVideoFile(null);
                    setSelectedLecture(null);
                  }}
                  className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadRecording}
                  disabled={!videoFile || uploadingId === selectedLecture.meetingId}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingId === selectedLecture.meetingId ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      {selectedLecture.isUpdate ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      {selectedLecture.isUpdate ? "Update Recording" : "Upload Recording"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Notes Modal */}
      {showNotesModal && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedLecture.notes ? "Update Lecture Notes" : "Upload Lecture Notes"}
              </h3>
              <button 
                onClick={() => {
                  setShowNotesModal(false);
                  setNotesFile(null);
                  setSelectedLecture(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-semibold text-slate-900">{selectedLecture.topic}</p>
                <p className="text-sm text-slate-500">
                  {selectedLecture.courseId?.title || "Course"}
                </p>
              </div>

              {/* Current notes if exists */}
              {selectedLecture.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedLecture.notes.name)}
                      <div>
                        <p className="font-semibold">{selectedLecture.notes.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatFileSize(selectedLecture.notes.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadNotes(selectedLecture)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Download Notes"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {notesFile ? (
                  <div className="space-y-2">
                    <FaFileAlt className="text-4xl text-green-600 mx-auto" />
                    <p className="font-semibold">{notesFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(notesFile.size)}
                    </p>
                    <button
                      onClick={() => setNotesFile(null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 mb-2">
                      Select lecture notes file
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                      onChange={(e) => handleFileSelect(e, 'notes')}
                      className="hidden"
                      id="notes-upload"
                    />
                    <label
                      htmlFor="notes-upload"
                      className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      PDF, DOC, PPT, TXT, JPG, PNG, XLS (Max 50MB)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setNotesFile(null);
                    setSelectedLecture(null);
                  }}
                  className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadNotes}
                  disabled={!notesFile || uploadingId === selectedLecture.meetingId}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingId === selectedLecture.meetingId ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      {selectedLecture.notes ? "Update Notes" : "Upload Notes"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    ? "border-2 border-blue-500 shadow-xl shadow-blue-100" 
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
                    <FaUserTie className="text-blue-600" />
                    {lecture.instructorId?.name || "Instructor"}
                  </div>

                  {isMyLecture && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-lg">
                      MY CLASS
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
                             : "bg-white hover:bg-blue-50 text-slate-900"
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
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                          {lecture.courseId?.title || "Course"}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 leading-tight">{lecture.topic}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <FaCalendarAlt className="text-blue-400" />
                     {new Date(lecture.startTime).toLocaleString([], {
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                     })}
                  </div>

                  {/* NOTES SECTION */}
                  {lecture.notes && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(lecture.notes.name)}
                          <span className="font-semibold text-green-800">Notes Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadNotes(lecture)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Download Notes"
                          >
                            <FaDownload />
                          </button>
                          {isMyLecture && (
                            <>
                              <button
                                onClick={() => handleShowNotesModal(lecture)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Update Notes"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteNotes(lecture.meetingId)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete Notes"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {lecture.notes.name} • {formatFileSize(lecture.notes.size)}
                      </p>
                    </div>
                  )}

                  {/* ACTIONS SECTION (Past Only) */}
                  {tab === "past" && (
                    <div className="space-y-3">
                      {/* RECORDING SECTION */}
                      <div className="flex gap-3">
                        {lecture.recordingUrl ? (
                          <>
                            <button 
                              onClick={() => window.open(lecture.recordingUrl, "_blank")}
                              className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                            >
                              <FaPlayCircle /> Watch Recording
                            </button>
                            {isMyLecture && (
                              <button
                                onClick={() => handleShowUploadModal(lecture, true)}
                                className="px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md"
                                title="Update Recording"
                              >
                                <FaEdit />
                              </button>
                            )}
                          </>
                        ) : (
                          <button 
                            onClick={() => handleShowUploadModal(lecture, false)}
                            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                          >
                            <FaUpload /> Upload Recording
                          </button>
                        )}
                      </div>

                      {/* NOTES UPLOAD/DOWNLOAD */}
                      <div className="flex gap-3">
                        {lecture.notes ? (
                          <button
                            onClick={() => handleShowNotesModal(lecture)}
                            className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all shadow-md"
                          >
                            <FaEdit /> Update Notes
                          </button>
                        ) : (
                          <button
                            onClick={() => handleShowNotesModal(lecture)}
                            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all shadow-md"
                          >
                            <FaFileAlt /> Upload Notes
                          </button>
                        )}
                      </div>
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
                    className="mt-4 text-blue-600 font-bold hover:underline"
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