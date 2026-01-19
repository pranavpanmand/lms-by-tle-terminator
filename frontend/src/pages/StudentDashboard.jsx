import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { FaTrophy, FaClipboardCheck, FaChartLine } from "react-icons/fa";

function StudentDashboard() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, avgPercentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/quiz/user/analytics`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setData(res.data.data);
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error("Error loading dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        My Learning Dashboard
      </h1>

      {/* 1. Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
            <FaClipboardCheck className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Quizzes Taken</p>
            <h3 className="text-2xl font-bold">{stats.totalQuizzes}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-full text-green-600">
            <FaChartLine className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Average Score</p>
            <h3 className="text-2xl font-bold">{stats.avgPercentage}%</h3>
          </div>
        </div>

        {/* Added a Placeholder card for future Gamification */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-50 rounded-full text-yellow-600">
            <FaTrophy className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Current Level</p>
            <h3 className="text-2xl font-bold">1</h3>
          </div>
        </div>
      </div>

      {/* 2. The Performance Graph (Comparison Mode) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Performance vs Class
        </h3>

        {data.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="quizTitle"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value, name) => {
                    if (name === "percentage")
                      return [`${value}%`, "Your Score"];
                    if (name === "classAverage")
                      return [`${value}%`, "Class Avg"];
                    if (name === "highestScore") return [`${value}%`, "Topper"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Quiz: ${label}`}
                />

                {/* Class Average (Gray Dotted Line) */}
                <Area
                  type="monotone"
                  dataKey="classAverage"
                  stroke="#9CA3AF"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Class Avg"
                />

                {/* Highest Score (Green Line) */}
                <Area
                  type="monotone"
                  dataKey="highestScore"
                  stroke="#10B981"
                  fill="transparent"
                  strokeWidth={2}
                  name="Highest"
                />

                {/* User Score (Purple Filled Area) */}
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  name="You"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            You haven't taken any quizzes yet.
          </div>
        )}
      </div>

      {/* 3. Recent Activity List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            Recent Quiz History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">Quiz Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Your Score</th>
                <th className="p-4 hidden sm:table-cell">Class Avg</th>
                <th className="p-4 hidden sm:table-cell">Topper</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data
                .slice()
                .reverse()
                .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">
                      {item.quizTitle}
                    </td>
                    <td className="p-4 text-gray-500">{item.date}</td>

                    <td className="p-4 font-bold text-indigo-700">
                      {item.score} / {item.totalQuestions}
                    </td>

                    {/* New Columns for Comparison */}
                    <td className="p-4 text-gray-500 hidden sm:table-cell">
                      {item.classAverage}%
                    </td>
                    <td className="p-4 text-green-600 font-medium hidden sm:table-cell">
                      {item.highestScore}%
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.percentage >= 70
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                        {item.percentage >= 70 ? "Passed" : "Needs Work"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
