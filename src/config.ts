import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  mongoDBURL: process.env.MONGOCDB_URL || "mongodb://localhost:27017/distance",
};
