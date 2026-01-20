import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}`);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDb;
