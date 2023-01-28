import mongoose from "mongoose";
import { IRoute, IStopTime, ITrip } from "./interfaces";

const RouteSchema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
  },
  route_id: {
    type: String,
  },
  agency_id: {
    type: String,
  },
  route_short_name: {
    type: String,
  },
  route_long_name: {
    type: String,
  },
  route_desc: {
    type: String,
  },
  route_type: {
    type: String,
  },
  route_color: {
    type: String,
  },
});

const TripSchema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
  },
  route_id: {
    type: String,
  },
  service_id: {
    type: String,
  },
  trip_id: {
    type: String,
  },
  trip_headsign: {
    type: String,
  },
  direction_id: {
    type: String,
  },
  shape_id: {
    type: String,
  },
});

const StopTimeSchema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
  },
  trip_id: {
    type: String,
  },
  arrival_time: {
    type: String,
  },
  departure_time: {
    type: String,
  },
  stop_id: {
    type: String,
  },
  stop_sequence: {
    type: String,
  },
  pickup_type: {
    type: String,
  },
  drop_off_type: {
    type: String,
  },
  shape_dist_traveled: {
    type: String,
  },
});

export const RouteModel = mongoose.model<IRoute & mongoose.Document>(
  "Route",
  RouteSchema
);

export const TripModel = mongoose.model<ITrip & mongoose.Document>(
  "Trip",
  TripSchema
);

export const StopModel = mongoose.model<IStopTime & mongoose.Document>(
  "stop_time",
  StopTimeSchema,
  "stop_times"
);
