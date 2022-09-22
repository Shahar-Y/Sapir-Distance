import dotenv from "dotenv";
import path from "path";
import {
  Client,
  DirectionsRequest,
  DirectionsResponseStatus,
  Language,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import axios from "axios";
import inquirer from "inquirer";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

inquirer.registerPrompt("datetime", require("inquirer-datepicker-prompt"));

const initializeMongo = async () => {
  mongoose.connection.on("connecting", () => {
    console.log("[MongoDB] connecting...");
  });

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] connected");
  });

  mongoose.connection.on("error", (error) => {
    console.log("oppssssss, error: " + error);
    process.exit(1);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("[MongoDB] disconnected");
    process.exit(1);
  });

  await mongoose.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
};

// the questions to the google api
const questions = [
  {
    type: "input",
    name: "origin",
    message: "Choose your starting point:",
  },
  {
    type: "input",
    name: "destination",
    message: "Choose your end point:",
  },
  {
    type: "list",
    name: "arrival_or_departure",
    message: "Departure time or arrival time?",
    choices: ["arrival", "departure"],
  },
  {
    type: "datetime",
    name: "dateTime",
    message: "Choose the time:",
    format: ["dd", "/", "mm", "/", "yyyy", " ", "hh", ":", "MM", " ", "TT"],
  },
];

// google api variables
let origin!: string;
let destination!: string;

let arrival_time!: number;
let departure_time!: number;

let points: number = 0;

const client = new Client();

/**
 *
 * @param text
 * @returns
 */
const getFromStringTheNumberOfMinutes = (text: string) => {
  const hourIncludes = text.includes("hours");

  const splitString = text.split(" ");

  let minute!: number;
  let hour!: number | undefined;

  if (hourIncludes) {
    hour = Number(splitString[0]) * 60;
    minute = Number(splitString[2]);
  } else minute = Number(splitString[0]);

  return hour ? hour + minute : minute;
};

/**
 * calc the point of the user to get a bed,
 * by - time to get to the the address givin and another questions
 * print in the end in the cmd the final point of the person
 */
const main = async (): Promise<void> => {
  // await inquirer.prompt(questions).then((answers) => {
  //   origin = answers.origin;
  //   destination = answers.destination;

  //   const unixTime = +new Date(answers.dateTime);

  //   if (answers.arrival_or_departure === 'arrival') arrival_time = unixTime;
  //   else departure_time = unixTime;
  // });

  // origin = 'נופר 14 רחובות ישראל';
  // origin = 'נחל נעמן 1 אשדוד ישראל';
  origin = "פריחת הסמדר 9 גבעת עדה ישראל";
  destination = "שלמה בן יוסף 32 תל אביב ישראל";
  departure_time = 1652853600;
  arrival_time = 1651523975;

  // set the arrival_time or departure_time
  let query = [];

  if (departure_time) query.push({ departure_time: departure_time });
  else query.push({ arrival_time: arrival_time });

  // query from google api for getting the routes
  const directionsRequest: DirectionsRequest = {
    params: {
      origin,
      destination,
      ...query,
      key: process.env.GOOGLE_MAPS_API_KEY || "",
      mode: TravelMode.transit,
      alternatives: true,
      language: Language.iw,
    },
  };

  // get the routes
  const results = await client.directions(directionsRequest);
  const data = results.data;
  console.log(data);

  // If we did not get back an answer of 'OK' - print it and the reason for this
  if (
    (data.status as unknown as DirectionsResponseStatus) !==
    DirectionsResponseStatus.OK
  ) {
    console.log("No routes found, Cause -", data.status);
    return;
  }

  const routes = data.routes;

  /**
   * The time it takes from point to point:
   * ((number of bus * bus time) + (number of bus * bus time) + .....) / 60
   *
   * Average waiting time per point:
   * (number of buses * 2) / 60
   */
  routes.forEach((route) => {
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        // if walking - add walking time
        if (step.travel_mode === TravelMode.walking) {
        }

        // if transit -
        if (step.travel_mode === TravelMode.transit) {
          // get the transit name
          const transit_details = step.transit_details;
          const line = transit_details.line;
          const name = line.name;

          // find in routes.csv - name === route_long_name , and bring route_id

          // find in trips.csv - route_id , and bring trip_id

          // find in stop_times.csv - trip_id , and bring the relevant arrival_time
        }

        // console.log(step.duration);
        // console.log(getFromStringTheNumberOfMinutes(step.duration.text));
      });
    });
  });

  // read csv file to find more info about the buses

  // ask more questions for add or remove points
  // ...
  // ...
  // ...

  console.log("----------------------------------------");
  console.log("\x1b[36m%s\x1b[0m", "Final points:", points);
  console.log("----------------------------------------");
};

(async () => {
  // connect to the database
  initializeMongo();

  // start the calculation of person
  const continueQuestions = [
    {
      type: "list",
      name: "continueGet",
      message: "Do another calculation?",
      choices: ["continue", "stop"],
    },
  ];

  let continueGet: boolean = true;

  // get the routs
  main();

  while (continueGet) {
    await main();

    await inquirer.prompt(continueQuestions).then((answers) => {
      if (answers.continueGet === "stop") continueGet = false;
    });
  }
})();
