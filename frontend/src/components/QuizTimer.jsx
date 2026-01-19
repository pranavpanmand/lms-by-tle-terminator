import { useEffect, useRef, useState } from "react";
import { FaClock } from "react-icons/fa";

/* ---------------- QuizTimer Component ----------------
   Props:
     - durationMinutes (number)
     - onExpire () => callback when time ends
   Behavior:
     - counts down in seconds
     - shows mm:ss and a progress bar
     - auto-calls onExpire when reaches 0
*/
function QuizTimer({ durationMinutes = 0, onExpire = () => {} }) {
  const totalSeconds = Math.max(0, Math.floor(durationMinutes * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  // Start countdown on mount (if duration > 0)
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (totalSeconds <= 0) return () => {};

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // we want to restart if durationMinutes changes
  }, [totalSeconds, onExpire]);

  // format mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const percent =
    totalSeconds > 0 ? Math.max(0, (secondsLeft / totalSeconds) * 100) : 0;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <FaClock className="text-indigo-600" />
        <span className="font-bold">
          {mm}:{ss}
        </span>
      </div>

      <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default QuizTimer