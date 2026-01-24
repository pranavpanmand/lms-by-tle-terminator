import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Atom, Zap } from "lucide-react";
import { Button } from "@radix-ui/themes";
import Loader from "../components/Loader";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PhysicsLab() {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const response = await axios.get(`${API}/physics/experiments`);
      setExperiments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching experiments:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1b1f2a] text-slate-100 pb-20"
      data-testid="physics-lab-page">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-800/90 to-orange-900/50" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 py-14">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-8 p-2 text-slate-300 hover:text-white hover:bg-white/10 font-bold rounded-xl">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Atom className="h-9 w-9 text-white" />
            </div>

            <div>
              <span className="inline-block mb-2 px-3 py-1 rounded-full bg-orange-400/20 border border-orange-300/30 text-orange-200 text-xs font-black uppercase tracking-widest">
                Physics Lab
              </span>

              <h1 className="text-4xl md:text-5xl font-black text-white">
                Explore Forces & Motion
              </h1>

              <p className="text-lg text-slate-300 mt-2">
                Conduct experiments, measure energy, and discover physics in
                action.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-8">
        {/* Experiments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiments.map((experiment) => (
            <div
              key={experiment._id}
              data-testid={`experiment-card-${experiment._id}`}
              onClick={() => navigate(`/experiment/physics/${experiment._id}`)}
              className="group cursor-pointer rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:-translate-y-2 hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="text-orange-400" />
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    experiment.difficulty === "easy"
                      ? "bg-green-500/20 text-green-300"
                      : experiment.difficulty === "medium"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                  }`}>
                  {experiment.difficulty}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {experiment.title}
              </h3>
              <p className="text-slate-400 font-medium mb-4">
                {experiment.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {experiment.materials.slice(0, 3).map((material, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-slate-300">
                    {material}
                  </span>
                ))}
                {experiment.materials.length > 3 && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-slate-300">
                    +{experiment.materials.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
