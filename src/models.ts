import mongoose from 'mongoose';

export const CoverSchema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
  },
  route_id: {
    type: Number,
  },
  service_id: {
    type: Number,
  },
  trip_id: {
    type: Number,
  },
  trip_headsign: {
    type: String,
  },
  direction_id: {
    type: Number,
  },
  shape_id: {
    type: Number,
  },
});
