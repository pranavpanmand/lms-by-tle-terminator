import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FlaskConical,
  Calculator,
  Atom,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@radix-ui/themes";
import Loader from "../components/Loader";
import {motion} from 'framer-motion'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const mainUrl = import.meta.env.VITE_MAIN_URL || "http://localhost:5173";

const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   initializeData();
  // }, []);

  // const initializeData = async () => {
  //   try {
  //     await axios.post(`${API}/init-data`);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Error initializing data:", error);
  //     setIsLoading(false);
  //   }
  // };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader/>
  //     </div>
  //   );
  // }
  
  const subjects = [
    {
      id: "math",
      title: "Math Explorer",
      description: "Master numbers, patterns, and logic through challenges.",
      icon: Calculator,
      color: "from-indigo-500 to-blue-600",
      bgImage: "https://images.unsplash.com/photo-1735116356965-ad5b323d1af8",
      path: "/math",
    },
    {
      id: "chemistry",
      title: "Chemistry Lab",
      description: "Experiment, react, and unlock chemical mysteries.",
      icon: FlaskConical,
      color: "from-lime-500 to-emerald-600",
      bgImage: "https://images.unsplash.com/photo-1633412748213-0cf8268c357f",
      path: "/chemistry",
    },
    {
      id: "physics",
      title: "Physics Arena",
      description: "Explore motion, energy, and the laws of the universe.",
      icon: Atom,
      color: "from-orange-500 to-amber-600",
      bgImage: "https://images.unsplash.com/photo-1675627453075-0f170b02186a",
      path: "/physics",
    },
  ];



  return (
    <div className="min-h-screen  bg-[#0b1220] text-slate-100 pb-20" data-testid="dashboard-page">
      {/* Back Button */}
      <div className="container mx-auto px-6 md:px-12 pt-6 c">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-4 hover:bg-slate-100 text-white hover:text-slate-900 rounded-xl px-4 py-2 font-bold"
          onClick={() => (window.location.href = mainUrl)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* ================= HERO ================= */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1633412748213-0cf8268c357f"
            alt="STEM Background"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-900/40" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
            Interactive STEM Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Explore. Experiment.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
              Dominate.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Learn Math, Physics, and Chemistry through challenges, experiments,
            and AI-powered guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/tutor")}
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-white/10">
              Ask AI Tutor
            </button>

            <button
              onClick={() => navigate("/math")}
              className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all">
              Start Learning
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-blue-200 to-indigo-400">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-16">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-lime-500">
              Adventure
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {subjects.map((subject, i) => {
              const Icon = subject.icon;

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(subject.path)}
                  className="group cursor-pointer rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                  {/* Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${subject.bgImage})` }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                      <Icon />
                    </div>

                    <h3 className="text-3xl font-black text-white mb-2">
                      {subject.title}
                    </h3>

                    <p className="text-white/90 mb-6">{subject.description}</p>

                    <div className="flex items-center font-bold text-white">
                      Start Learning
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Quick Stats */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto bg-slate-200 rounded-[2.5rem] shadow-xl border border-slate-100 p-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: "100+", label: "Math Challenges" },
              { value: "20+", label: "Experiments" },
              { value: "24/7", label: "AI Tutor" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}>
                <div className="text-4xl font-black text-indigo-600">
                  {stat.value}
                </div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
