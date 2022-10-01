import mongoose from "mongoose";
import { IPersonResult } from "./person.interface";

const PersonSchema: mongoose.Schema = new mongoose.Schema({
  sex: {
    type: String,
  },
  fullName: {
    type: String,
  },
  serviceType: {
    type: String,
  },
  address: {
    type: String,
  },
  statusExpiration: {
    type: String,
  },
  // Json data
  routeCalculations: {
    type: String,
  },
});

export const PersonModel = mongoose.model<IPersonResult & mongoose.Document>(
  "Person",
  PersonSchema
);
