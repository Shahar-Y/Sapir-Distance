import {
  Client,
  DirectionsRequest,
  DirectionsResponseStatus,
  TrafficModel,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import inquirer from 'inquirer';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const questions = [
  {
    type: 'input',
    name: 'origin',
    message: 'Choose your starting point:',
  },
  {
    type: 'input',
    name: 'destination',
    message: 'Choose your end point:',
  },
  {
    type: 'list',
    name: 'arrival_or_departure',
    message: 'Departure time or arrival time?',
    choices: ['arrival', 'departure'],
  },
  {
    type: 'list',
    name: 'time',
    message: 'Choose the time:',
    choices: [
      '00',
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
    ],
  },
];

let origin!: string;
let destination!: string;

let arrival_time!: number;
let departure_time!: number;

let points: number = 0;

const client = new Client();

(async () => {
  await inquirer.prompt(questions).then((answers) => {
    origin = answers.origin;
    destination = answers.destination;

    if (answers.arrival_or_departure === 'arrival') arrival_time = answers.time;
    else departure_time = answers.time;
  });

  // origin = 'פריחת הסמדר 9 גבעת עדה ישראל';
  // destination = 'שלמה בן יוסף 32 תל אביב ישראל';
  // departure_time = 1651523975;
  // arrival_time = 1651523975;

  const axiosInstance = axios.create({
    baseURL: 'https://some-domain.com/api/',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
  });

  // set the arrival_time or departure_time
  let query = [];

  if (departure_time) query.push({ departure_time: departure_time });
  else query.push({ arrival_time: arrival_time });

  const directionsRequest: DirectionsRequest = {
    params: {
      origin,
      destination,
      ...query,
      key: process.env.GOOGLE_MAPS_API_KEY || '',
      mode: TravelMode.transit,
      // traffic_model: TrafficModel.best_guess,
      // traffic_model: TrafficModel.pessimistic,
      // traffic_model: TrafficModel.optimistic,
      alternatives: true,
    },
  };

  const results = await client.directions(directionsRequest);
  const data = results.data;

  // If we did not get back an answer of 'OK' - print it and the reason for this
  if (
    (data.status as unknown as DirectionsResponseStatus) !==
    DirectionsResponseStatus.OK
  ) {
    console.log('No routes found, Cause -', data.status);
    return;
  }

  const routes = data.routes;

  /**
   * route params:
   * legs        - array
   */
  routes.forEach((route) => {
    /**
     * leg params:
     * arrival_time     - object
     * departure_time   - object
     * distance         - object
     * duration         - object
     * steps            - array
     */
    route.legs.forEach((leg) => {
      console.log(leg.duration);

      /**
       * step params:
       * steps        - array
       * travel_mode  - TravelMode
       */
      leg.steps.forEach((step) => {
        console.log(step.travel_mode);
      });
    });
  });

  // console.log('Final points:', points);
})();
