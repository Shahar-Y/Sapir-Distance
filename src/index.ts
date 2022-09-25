import {
  Client,
  DirectionsRequest,
  DirectionsResponseStatus,
  Language,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import { config } from "./config";
import mongoose, { Mongoose } from "mongoose";
import { RouteModel, StopModel, TripModel } from "./models";
import { IRoute, IStopTime, ITrip } from "./interfaces";
import { TimeObject } from "./timeFunctions";

const arrivalTime: TimeObject = new TimeObject("09:00:00");

const initializeMongo = async () => {
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

// google api variables
let origin!: string;
let destination!: string;

let arrival_time!: number;
let departure_time!: number;

let points: number = 0;

const client = new Client();

/**
 * calc the point of the user to get a bed,
 * by - time to get to the the address givin and another questions
 * print in the end in the cmd the final point of the person
 */
const main = async (): Promise<void> => {
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
      key: config.googleMapsApiKey,
      mode: TravelMode.transit,
      alternatives: true,
      language: Language.iw,
    },
  };

  // get the routes
  const results = await client.directions(directionsRequest);
  const data = results.data;
  console.log("starting!");
  // console.log(data);
  const routes = data.routes;
  const leg = routes[0].legs[0];
  const steps = leg.steps;
  for (let i = 0; i < steps.length; i++) {
    const bigStep = steps[i];
    const travelMode = bigStep.travel_mode.toLocaleLowerCase();
    try {
      if (travelMode == TravelMode.transit) {
        // console.log("bigStep: ", bigStep);
        const line = bigStep.transit_details.line;
        // compare line name to mongo routes long name
        const lineRoute: IRoute | null = await RouteModel.findOne({
          route_long_name: line.name,
        });
        // console.log("lineRoute: ", lineRoute);
        const lineTrips: ITrip[] = await TripModel.find({
          route_id: lineRoute?.route_id,
        });
        // console.log("lineTrips: ", lineTrips);

        const tripIds: String[] = lineTrips.map((trip) => trip.trip_id);
        // console.log("tripIds: ", tripIds);

        const minArrivalTime: TimeObject = new TimeObject(
          arrivalTime.objectToString()
        ).addHours(-1);

        const maxArrivalTime = new TimeObject(
          arrivalTime.objectToString()
        ).addHours(1);

        const start = new Date().getTime();
        console.log("starting stopTimes", start);
        const query = StopModel.find(
          { trip_id: "1_061022" }
          // {
          // todo: change this
          // _id: mongoose.Types.ObjectId("63302b5852e277523d664d0e"),

          // trip_id: tripIds[0],
          // arrival_time: {
          //   $gt: minArrivalTime.objectToString(),
          //   $lt: maxArrivalTime.objectToString(),
          // },
          // }
        );
        const stopTimes = (await query) || [];

        console.log("stopTimes: ", stopTimes);
        const end = new Date().getTime();

        console.log("ended stopTimes", end);
        console.log("diff: ", end - start);
        // const lineArrivalTime = line.
        // minArrivalTime =
        // const minArrivalTime = await StopTimeModel.findOne({
        //   trip_id: { $in: tripIds }, arrival_time: { $gt: minArrivalTime, $lt: maxArrivalTime}
        //   )
      } else {
        console.log("non-transit: ", bigStep.travel_mode);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // If we did not get back an answer of 'OK' - print it and the reason for this
  if (
    (data.status as unknown as DirectionsResponseStatus) !==
    DirectionsResponseStatus.OK
  ) {
    console.log("No routes found, Cause -", data.status);
    return;
  }

  // const routes = data.routes;

  /**
   * The time it takes from point to point:
   * ((number of bus * bus time) + (number of bus * bus time) + .....) / 60
   *
   * Average waiting time per point:
   * (number of buses * 2) / 60
   */
  // routes.forEach((route) => {
  //   route.legs.forEach((leg) => {
  //     leg.steps.forEach((step) => {
  //       // if walking - add walking time
  //       if (step.travel_mode === TravelMode.walking) {
  //       }

  //       // if transit -
  //       if (step.travel_mode === TravelMode.transit) {
  //         // get the transit name
  //         const transit_details = step.transit_details;
  //         const line = transit_details.line;
  //         const name = line.name;

  //         // find in routes.csv - name === route_long_name , and bring route_id

  //         // find in trips.csv - route_id , and bring trip_id

  //         // find in stop_times.csv - trip_id , and bring the relevant arrival_time
  //       }

  //       // console.log(step.duration);
  //       // console.log(getFromStringTheNumberOfMinutes(step.duration.text));
  //     });
  //   });
  // });

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

  main();
})();
