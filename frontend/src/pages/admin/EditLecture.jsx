// import axios from 'axios'
// import React, { useState } from 'react'
// import { FaArrowLeft } from "react-icons/fa"
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate, useParams } from 'react-router-dom'
// import { serverUrl } from '../../App'
// import { setLectureData } from '../../redux/lectureSlice'
// import { toast } from 'react-toastify'
// import { ClipLoader } from 'react-spinners'

// import { FaPlus, FaPen } from "react-icons/fa";

// function EditLecture() {
//     const [loading,setLoading]= useState(false)
//     const [loading1,setLoading1]= useState(false)
//     const {courseId , lectureId} = useParams()
//     const {lectureData} = useSelector(state=>state.lecture)
//     const dispatch = useDispatch()
//     const selectedLecture = lectureData.find(lecture => lecture._id === lectureId)
//     const [videoUrl,setVideoUrl] = useState(null)
//     const [lectureTitle,setLectureTitle] = useState(selectedLecture.lectureTitle)
//     const [isPreviewFree,setIsPreviewFree] = useState(false)

//     const formData = new FormData()
//     formData.append("lectureTitle",lectureTitle)
//     formData.append("videoUrl",videoUrl)
//     formData.append("isPreviewFree",isPreviewFree)

//     const editLecture = async () => {
//       setLoading(true)
//       try {
//         const result = await axios.post(serverUrl + `/api/course/editlecture/${lectureId}` , formData , {withCredentials:true})
//         console.log(result.data)
//         dispatch(setLectureData([...lectureData,result.data]))
//         toast.success("Lecture Updated")
//         navigate("/courses")
//         setLoading(false)
//       } catch (error) {
//         console.log(error)
//         toast.error(error.response.data.message)
//         setLoading(false)
//       }
//     }

//     const removeLecture = async () => {
//       setLoading1(true)
//       try {
//         const result = await axios.delete(serverUrl + `/api/course/removelecture/${lectureId}` , {withCredentials:true})
//         console.log(result.data)
//         toast.success("Lecture Removed")
//        navigate(`/createlecture/${courseId}`)
//         setLoading1(false)
//       } catch (error) {
//         console.log(error)
//         toast.error("Lecture remove error")
//         setLoading1(false)
//       }

//     }

//     const navigate = useNavigate()
//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 space-y-6">

//         {/* Header Inside Box */}
//         <div className="flex items-center gap-2 mb-2">
//           <FaArrowLeft className="text-gray-600 cursor-pointer" onClick={()=>navigate(`/createlecture/${courseId}`)} />
//           <h2 className="text-xl font-semibold text-gray-800">Update Your Lecture</h2>
//         </div>

//         {/* Instruction */}
//         <div>

//           <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all text-sm" disabled={loading1} onClick={removeLecture}>
//             {loading1?<ClipLoader size={30} color='white'/>:"Remove Lecture"}
//           </button>
//         </div>

//         {/* Input Fields */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//             <input
//               type="text"
//               className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[black]focus:outline-none"
//               placeholder={selectedLecture.lectureTitle}
//               onChange={(e)=>setLectureTitle(e.target.value)}
//               value={lectureTitle}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Video *</label>
//             <input
//               type="file"
//               required
//               accept='video/*'
//               className="w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-700 file:text-[white] hover:file:bg-gray-500"
//               onChange={(e)=>setVideoUrl(e.target.files[0])}
//             />
//           </div>

//           {/* Toggle */}
//           <div className="flex items-center gap-3">
//             <input
//               type="checkbox"

//               className="accent-[black] h-4 w-4"

//               onChange={() => setIsPreviewFree(prev=>!prev)}
//             />
//             <label htmlFor="isFree" className="text-sm text-gray-700">Is this video FREE</label>
//           </div>
//         </div>
//          <div>
//           {loading ?<p>Uploading video... Please wait.</p>:""}
//          </div>
//         {/* Submit Button */}
//         <div className="pt-4">
//           <button className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition" disabled={loading} onClick={editLecture}>
//             {loading?<ClipLoader size={30} color='white'/> :"Update Lecture"}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default EditLecture

import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaPen, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
import { setLectureData } from "../../redux/lectureSlice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

function EditLecture() {
  const navigate = useNavigate();
  const { courseId, lectureId } = useParams();
  const dispatch = useDispatch();
  const { lectureData } = useSelector((state) => state.lecture);

  const selectedLecture = lectureData.find((l) => l._id === lectureId);

  const [videoUrl, setVideoUrl] = useState(null);
  const [lectureTitle, setLectureTitle] = useState(
    selectedLecture.lectureTitle
  );
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  // ===== QUIZ STATE =====
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    axios
      .get(serverUrl + `/api/quiz/${lectureId}`, { withCredentials: true })
      .then((r) => setQuiz(r.data))
      .catch(() => setQuiz(null));
  }, [lectureId]);

  const editLecture = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("lectureTitle", lectureTitle);
      formData.append("videoUrl", videoUrl);
      formData.append("isPreviewFree", isPreviewFree);

      const result = await axios.post(
        serverUrl + `/api/course/editlecture/${lectureId}`,
        formData,
        { withCredentials: true }
      );
      dispatch(setLectureData([...lectureData, result.data]));
      toast.success("Lecture Updated");
      navigate("/courses");
    } catch (e) {
      toast.error("Update Failed");
      console.log(e);
    }
    setLoading(false);
  };

  const removeLecture = async () => {
    setLoading1(true);
    try {
      await axios.delete(serverUrl + `/api/course/removelecture/${lectureId}`, {
        withCredentials: true,
      });
      toast.success("Lecture Removed");
      navigate(`/createlecture/${courseId}`);
    } catch {
      toast.error("Delete Failed");
    }
    setLoading1(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-2">
          <FaArrowLeft
            className="cursor-pointer"
            onClick={() => navigate(`/createlecture/${courseId}`)}
          />
          <h2 className="text-xl font-semibold">Update Your Lecture</h2>
        </div>

        {/* QUIZ SECTION */}
        <div className="border rounded p-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Lecture Quiz</h3>

            {!quiz ? (
              <button
                onClick={() =>
                  navigate(`/admin/add-quiz/${lectureId}/${courseId}`)
                }
                className="flex items-center gap-2 px-3 py-1 rounded bg-indigo-600 text-white text-sm"
              >
                <FaPlus /> Add Quiz
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/edit-quiz/${quiz._id}`)}
                  className="flex items-center gap-2 px-3 py-1 rounded bg-green-600 text-white text-sm"
                >
                  <FaPen /> Edit
                </button>

                <button
                  onClick={async () => {
                    if (!window.confirm("Delete quiz?")) return;
                    await axios.delete(serverUrl + `/api/quiz/${quiz._id}`, {
                      withCredentials: true,
                    });
                    toast.success("Quiz Deleted");
                    setQuiz(null);
                  }}
                  className="flex items-center gap-2 px-3 py-1 rounded bg-red-600 text-white text-sm"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          {quiz && (
            <p className="text-xs mt-1 text-gray-600">
              {quiz.questions.length} Questions
            </p>
          )}
        </div>

        {/* REMOVE LECTURE */}
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md"
          disabled={loading1}
          onClick={removeLecture}
        >
          {loading1 ? <ClipLoader size={20} color="white" /> : "Remove Lecture"}
        </button>

        {/* FORM */}
        <input
          value={lectureTitle}
          onChange={(e) => setLectureTitle(e.target.value)}
          className="w-full border p-3 rounded"
          placeholder="Title"
        />

        <div className="border-2 border-dashed border-gray-400 rounded-xl p-5 text-center hover:border-black transition">
          <label className="cursor-pointer block">
            <p className="text-sm text-gray-600 mb-2">
              {videoUrl ? "Video Selected ✔" : "Click to Upload Lecture Video"}
            </p>

            <p className="text-xs text-gray-400">MP4, WebM, MOV supported</p>

            <div className="relative group border-2 border-dashed border-indigo-400 rounded-2xl p-6 bg-indigo-50 hover:bg-white hover:border-indigo-600 transition-all duration-300">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md group-hover:scale-110 transition">
                  ⬆
                </div>

                <p className="text-sm font-semibold text-gray-700">
                  {videoUrl
                    ? "Video Selected Successfully ✔"
                    : "Upload Lecture Video"}
                </p>

                <p className="text-xs text-gray-500">
                  Drag & drop or click to browse (MP4, MOV, WebM)
                </p>

                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideoUrl(e.target.files[0])}
                />
              </label>

              {videoUrl && (
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                  Ready to Upload
                </span>
              )}
            </div>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={() => setIsPreviewFree(!isPreviewFree)}
          />
          Is this video FREE
        </label>

        <button
          onClick={editLecture}
          className="w-full bg-black text-white py-3 rounded"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Update Lecture"}
        </button>
      </div>
    </div>
  );
}

export default EditLecture;
