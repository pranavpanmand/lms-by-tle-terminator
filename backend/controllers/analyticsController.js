import LectureSession from "../models/LectureSession.js";
import LectureAnalytics from "../models/LectureAnalytics.js";

/* ---------- START VIEW ---------- */
export const startLecture = async (req, res) => {
  try {
    const { lectureId } = req.body;
    const userId = req.userId;// ✅ SAFE

    if (!lectureId) {
      return res.status(400).json({ message: "lectureId required" });
    }

    // USER SESSION (optional)
    if (userId) {
      await LectureSession.findOneAndUpdate(
        { userId, lectureId },
        { $inc: { views: 1 } },
        { upsert: true }
      );
    }

    // GLOBAL ANALYTICS
    await LectureAnalytics.findOneAndUpdate(
      { lectureId },
      { $inc: { totalViews: 1 } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("startLecture error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- WATCH TIME ---------- */
export const addWatchTime = async (req, res) => {
  const { lectureId, delta, duration } = req.body;
  const userId = req.userId;

  let session = await LectureSession.findOneAndUpdate(
    { userId, lectureId },
    { $inc: { watchedSeconds: delta } },
    { upsert: true, new: true }
  );

  // global watch time
  await LectureAnalytics.findOneAndUpdate(
    { lectureId },
    { $inc: { totalWatchTimeSec: delta } },
    { upsert: true }
  );

  // ✅ VIEW ONLY ONCE & ONLY AFTER 50%
  if (!session.viewed && session.watchedSeconds >= duration * 0.5) {
    session.viewed = true;
    await session.save();

    await LectureAnalytics.findOneAndUpdate(
      { lectureId },
      { $inc: { totalViews: 1 } },
      { upsert: true }
    );
  }

  res.json({ success: true });
};

/* ---------- ATTENTION AVG ---------- */
export const addAttention = async (req, res) => {
  const { lectureId, t, score } = req.body;
  const userId = req.userId;
  console.log("📌 ADD ATTENTION HIT", lectureId, t, score);

  // save per-user attention
  await LectureSession.findOneAndUpdate(
    { userId, lectureId },
    { $set: { [`attentionMap.${t}`]: score } },
    { upsert: true }
  );

  const analytics =
    (await LectureAnalytics.findOne({ lectureId })) ||
    (await LectureAnalytics.create({ lectureId }));

  const key = String(t);
  const point = analytics.attentionTimelineAvg.get(key);

  if (!point) {
    analytics.attentionTimelineAvg.set(key, {
      avgScore: score,
      samples: 1,
    });
  } else {
    point.avgScore =
      (point.avgScore * point.samples + score) / (point.samples + 1);
    point.samples += 1;
  }

  await analytics.save();
  res.json({ success: true });
};

/* ---------- FETCH ---------- */
export const getLectureAnalytics = async (req, res) => {
  const { lectureId } = req.params;

  const analytics =
    (await LectureAnalytics.findOne({ lectureId })) || {
      totalViews: 0,
      totalWatchTimeSec: 0,
      attentionTimelineAvg: new Map(),
    };

  const sessions = await LectureSession.find({ lectureId });
  const usersCount = sessions.length;

  // get max video second seen
  let maxT = 0;
  analytics.attentionTimelineAvg.forEach((_, k) => {
    maxT = Math.max(maxT, Number(k));
  });

  const timeline = [];

  for (let t = 0; t <= maxT; t++) {
    const point = analytics.attentionTimelineAvg.get(String(t));

    if (!point) {
      // 👈 skipped second → attention 0
      timeline.push({ t, avgScore: 0 });
    } else {
      timeline.push({
        t,
        avgScore: Math.round(point.avgScore),
      });
    }
  }

  res.json({
    totalViews: analytics.totalViews,
    totalWatchTimeSec: analytics.totalWatchTimeSec,
    attentionTimelineAvg: timeline,
  });
};

export const addView = async (req, res) => {
  const { lectureId } = req.body;
  const userId = req.userId;

  const session = await LectureSession.findOne({ userId, lectureId });

  if (!session || session.viewed) {
    return res.json({ success: true });
  }

  session.viewed = true;
  await session.save();

  await LectureAnalytics.findOneAndUpdate(
    { lectureId },
    { $inc: { totalViews: 1 } },
    { upsert: true }
  );

  res.json({ success: true });
};