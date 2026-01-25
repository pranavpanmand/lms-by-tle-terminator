import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdventureSection({ adventures }) {
  const [mode, setMode] = useState("quiz");
  const navigate = useNavigate();

  const activeSection = adventures.find((a) => a.id === mode);

  return (
    <section className="py-24 px-6 bg-gradient-to-r from-blue-200 to-indigo-400">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-center mb-10">
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-lime-500">
            Adventure
          </span>
        </motion.h2>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/80 backdrop-blur-lg p-1 rounded-2xl shadow-lg flex">
            {["quiz", "experiment"].map((type) => (
              <button
                key={type}
                onClick={() => setMode(type)}
                className={`px-8 py-3 rounded-xl font-black uppercase text-sm transition-all
                  ${
                    mode === type
                      ? "bg-slate-900 text-white shadow-lg scale-105"
                      : "text-slate-700 hover:bg-slate-200"
                  }
                `}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid md:grid-cols-3 gap-8">
          {activeSection.items.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -10 }}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${item.bgImage})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                    <Icon />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-white/90 mb-6">{item.description}</p>

                  <div className="flex items-center font-bold text-white">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
