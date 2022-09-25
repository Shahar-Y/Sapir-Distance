export interface IRoute {
  _id: String;
  route_id: String;
  agency_id: String;
  route_short_name: String;
  route_long_name: String;
  route_desc: String;
  route_type: String;
  route_color: String;
}

export interface ITrip {
  _id: String;
  route_id: String;
  service_id: String;
  trip_id: String;
  trip_headsign: String;
  direction_id: String;
  shape_id: String;
}

export interface IStopTime {
  _id: String;
  trip_id: String;
  arrival_time: String;
  departure_time: String;
  stop_id: String;
  stop_sequence: String;
  pickup_type: String;
  drop_off_type: String;
  shape_dist_traveled: String;
}
