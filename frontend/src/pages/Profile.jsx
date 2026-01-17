import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeftLong,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
} from "react-icons/fa6";

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  // console.log(userData)

  const rankColors = {
    Novice: "bg-gray-200 text-gray-800",
    Apprentice: "bg-green-200 text-green-800",
    Expert: "bg-blue-200 text-blue-800",
    Master: "bg-purple-200 text-purple-800",
    Terminator: "bg-red-200 text-red-800",
    MAXED: "bg-yellow-300 text-yellow-900",
    Unranked: "bg-slate-200 text-slate-700",
  };

  const renderSocialIcon = (platform, url) => {
    if (!url) return null;
    const icons = {
      github: <FaGithub className="hover:text-black transition-colors" />,
      linkedin: (
        <FaLinkedin className="hover:text-blue-600 transition-colors" />
      ),
      twitter: <FaTwitter className="hover:text-sky-500 transition-colors" />,
      personalWebsite: (
        <FaGlobe className="hover:text-green-600 transition-colors" />
      ),
    };
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        key={platform}
        className="text-2xl text-gray-600">
        {icons[platform]}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-2xl w-full relative border border-gray-100">
        <FaArrowLeftLong
          className="absolute top-8 left-8 w-6 h-6 cursor-pointer text-gray-400 hover:text-black transition"
          onClick={() => navigate("/")}
        />

        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
          {userData?.photoUrl ? (
            <img
              src={userData.photoUrl}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full text-white flex items-center justify-center text-4xl font-bold bg-black border-4 border-white shadow-md">
              {userData?.name?.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h2 className="text-3xl font-extrabold mt-4 text-gray-800">
            {userData?.name}
          </h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-full mt-2">
            {userData?.role}
          </span>

          <span
            className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full mt-2
            ${rankColors[userData?.rank || "Unranked"]}`}>
            {userData?.rank || "Unranked"}
          </span>

          <div className="flex gap-5 mt-5">
            {userData?.socialLinks &&
              Object.entries(userData.socialLinks).map(([platform, url]) =>
                renderSocialIcon(platform, url)
              )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Email Address
              </h4>
              <p className="text-gray-700 font-medium">{userData?.email}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase">Bio</h4>
              <p className="text-gray-600 leading-relaxed">
                {userData?.description || "No bio added yet."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {userData?.skills?.length > 0 ? (
                  userData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-black text-white text-xs rounded-lg font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">None listed</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {userData?.interests?.length > 0 ? (
                  userData.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">None listed</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                Preferred Fields
              </h4>
              <div className="flex flex-wrap gap-2">
                {userData?.preferredFields?.length > 0 ? (
                  userData.preferredFields.map((fields, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      {fields}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">None listed</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-black">
              {userData?.enrolledCourses?.length || 0}
            </p>
            <p className="text-xs text-gray-400 uppercase font-bold">Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {userData?.xp || 0}
            </p>
            <p className="text-sm text-gray-400 uppercase font-bold">XP</p>
          </div>

          <button
            className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg cursor-pointer"
            onClick={() => navigate("/editprofile")}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
