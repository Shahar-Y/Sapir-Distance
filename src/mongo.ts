import mongoose from "mongoose";
import { config } from "./config";

export const initializeMongo = async () => {
  mongoose.connection.on("connecting", () => {
    console.log("[MongoDB] connecting...");
  });

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] connected");
  });

  mongoose.connection.on("error", (error: Error) => {
    console.log("oppssssss, error: " + error);
    process.exit(1);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("[MongoDB] disconnected");
    process.exit(1);
  });

  await mongoose.connect(config.mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
};
