import mongoose from "mongoose";
import { algorithmFunc } from "./algorithm";
import { initializeMongo } from "./mongo";
import { compareRoutes } from "./timeFunctions";

// origin = 'נופר 14 רחובות ישראל';
// origin = 'נחל נעמן 1 אשדוד ישראל';
const origin = "פריחת הסמדר 9 גבעת עדה ישראל";
// origin = "קיבוץ דפנה";
const destination = "שלמה בן יוסף 32 תל אביב ישראל";
//   departure_time = new Date(2022, 10, 2, 7);
const arrival_time = new Date(2022, 10, 2, 9);

(async () => {
  // connect to the database
  await initializeMongo();

  const solution = await algorithmFunc(origin, destination, arrival_time);

  // calculate average total time of first three routes
  const avgTotalTime =
    solution.slice(0, 3).reduce((sum, curr) => sum + curr.totalTime, 0) / 3;
  console.log(avgTotalTime);

  mongoose.connection.close();
})();
