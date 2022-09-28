import {
  Client,
  DirectionsRequest,
  DirectionsResponseStatus,
  DirectionsRoute,
  Language,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import { config } from "./config";
import { RouteModel, StopModel, TripModel } from "./models";
import { IRoute, IStopTime, ITrip } from "./interfaces";
import { compareRoutes, TimeObject } from "./timeFunctions";

const arrivalTime: TimeObject = new TimeObject("09:00:00");

// Takes traffic into consideration 10% more than estimated
const travelTimeDialation: number = 1.1;

const client = new Client();

// The type explaining the step in the route
export type StepExplanation = {
  lineName: string;
  routeShortName: string;
  stepTotalTimeMins: number;
  avgWaitingTimeRealMins: number;
  stepTransitDurationMins: number;
};

// The route object that will be returned
export type CalculatedRoute = {
  route: DirectionsRoute;
  totalTime: number;
  explanation: StepExplanation[];
};

/**
 * Calculates the total time of all routes by adding the total time of each step.
 * @param {string} origin - The origin of the route.
 * @param {string} destination - The destination of the route.
 * @param {Date | number} arrival_time - The arrival time of the route.
 * @param {Date | number} departure_time - The departure time of the route.
 * If both departure_time and arrival_time are provided, arrival_time is ignored.
 * @returns {Promise<DirectionsRoute[]>} - The routes with time estimates and explanations.
 */
export const algorithmFunc = async (
  origin: string,
  destination: string,
  arrival_time: Date | number,
  departure_time?: Date | number
): Promise<CalculatedRoute[]> => {
  let query = {};

  if (departure_time) query = { departure_time };
  else query = { arrival_time };

  // query from google api for getting the routes
  const directionsRequest: DirectionsRequest = {
    params: {
      ...query,
      origin,
      destination,
      key: config.googleMapsApiKey,
      mode: TravelMode.transit,
      alternatives: true,
      language: Language.iw,
    },
  };

  // get the routes
  const results = await client.directions(directionsRequest);
  if (!(results.data && results.data.routes && results.data.routes.length)) {
    throw new Error("No routes found");
  }

  const data = results.data;
  console.log("starting!");
  // console.log(data);
  const routes = data.routes;
  const routeTimesArray = [];
  // Only first route!
  for (let routeIndex = 0; routeIndex < routes.length; routeIndex++) {
    let routeTotalTime = 0;
    const leg = routes[routeIndex].legs[0];
    const steps = leg.steps;
    const explanation = [];

    for (let i = 0; i < steps.length; i++) {
      const bigStep = steps[i];
      const travelMode = bigStep.travel_mode.toLocaleLowerCase();
      try {
        // Check if using transit in this step. Otherwise - walking.
        if (travelMode == TravelMode.transit) {
          const lineName = bigStep.transit_details.line.name;

          // Compare unique line name to mongo routes' long name
          const lineRoute: IRoute | null = await RouteModel.findOne({
            route_long_name: lineName,
          });

          // Get all trips of the specific line
          const lineTrips: ITrip[] = await TripModel.find({
            route_id: lineRoute?.route_id,
          });
          const tripIds: String[] = lineTrips.map((trip) => trip.trip_id);

          // Time-frame of 3 hours and one minute
          const beforeTimeHRS = 2;
          const afterTimeHRS = 1;
          const timeFrameHRS = afterTimeHRS + beforeTimeHRS;
          const mongoHoursCorrection = -2;

          const minArrivalTime: TimeObject = new TimeObject(
            arrivalTime.objectToString()
          ).addHours(-beforeTimeHRS);
          const maxArrivalTime = new TimeObject(
            arrivalTime.objectToString()
          ).addHours(afterTimeHRS);

          const start = new Date().getTime();

          // Get all stop times of all trips within the time range.
          // Add 2 hours to correct the time in mongo stop times
          const stopTimesQuery = {
            trip_id: { $in: tripIds },
            arrival_time: {
              $gt: minArrivalTime
                .addHours(mongoHoursCorrection)
                .objectToString(),
              $lt: maxArrivalTime
                .addHours(mongoHoursCorrection)
                .objectToString(),
            },
            stop_sequence: "1",
          };
          const stopTimes: IStopTime[] = await StopModel.find(stopTimesQuery);

          console.log("stopTimes length:", stopTimes.length);
          const end = new Date().getTime();
          console.log("diff: ", end - start);

          // Balancing factor in case of only one line in the time frame,
          const numOfBussesInTimeFrame =
            stopTimes.length - 1 > 0 ? stopTimes.length - 1 : 1;
          const avgWaitingTimeMins =
            (timeFrameHRS / (numOfBussesInTimeFrame * 2)) * 60;

          // Factor up to 20 mins of waiting time
          const avgWaitingTimeRealMins =
            avgWaitingTimeMins > 20 ? 20 : avgWaitingTimeMins;

          const stepTransitDurationMins =
            (bigStep.duration.value * travelTimeDialation) / 60;
          const stepTotalTimeMins =
            stepTransitDurationMins + avgWaitingTimeRealMins;
          console.log(
            `***** stepTotalTimeMins: ${stepTransitDurationMins} + ${avgWaitingTimeRealMins} = ${stepTotalTimeMins}`
          );
          routeTotalTime += stepTotalTimeMins;

          // Add the step explanation to the explanation array
          explanation.push({
            lineName,
            routeShortName: lineRoute?.route_short_name.toString() || "",
            stepTotalTimeMins,
            avgWaitingTimeRealMins,
            stepTransitDurationMins,
          });
        } else {
          routeTotalTime += bigStep.duration.value / 60;
          // Add the step explanation to the explanation array
          explanation.push({
            lineName: "walking",
            routeShortName: "walking",
            stepTotalTimeMins: bigStep.duration.value / 60,
            avgWaitingTimeRealMins: 0,
            stepTransitDurationMins: 0,
          });

          console.log(
            `step ${i} - non-transit: ${bigStep.travel_mode} ${
              bigStep.duration.value / 60
            } minutes`
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    console.log(`total time: ${routeTotalTime / 60}`);
    // If we did not get back an answer of 'OK' - print it and the reason for this
    if (
      (data.status as unknown as DirectionsResponseStatus) !==
      DirectionsResponseStatus.OK
    ) {
      console.log("No routes found, Cause -", data.status);
      return [];
    }

    routeTimesArray.push({
      route: routes[routeIndex],
      totalTime: routeTotalTime,
      explanation,
    });
  }

  routeTimesArray.sort(compareRoutes);
  return routeTimesArray;
};
