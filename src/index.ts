import {
  Client,
  DirectionsRequest,
  DirectionsResponseStatus,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import inquirer from 'inquirer';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

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
    type: 'datetime',
    name: 'dateTime',
    message: 'Choose the time:',
    format: ['dd', '/', 'mm', '/', 'yyyy', ' ', 'hh', ':', 'MM', ' ', 'TT'],
  },
];

let origin!: string;
let destination!: string;

let arrival_time!: number;
let departure_time!: number;

let points: number = 0;

const client = new Client();

const getFromStringTheNumberOfMinutes = (text: string) => {
  const hourIncludes = text.includes('hours');

  const splitString = text.split(' ');

  let minute!: number;
  let hour!: number | undefined;

  if (hourIncludes) {
    hour = Number(splitString[0]) * 60;
    minute = Number(splitString[2]);
  } else minute = Number(splitString[0]);

  return hour ? hour + minute : minute;
};

const main = async () => {
  // await inquirer.prompt(questions).then((answers) => {
  //   origin = answers.origin;
  //   destination = answers.destination;

  //   const unixTime = +new Date(answers.dateTime);

  //   if (answers.arrival_or_departure === 'arrival') arrival_time = unixTime;
  //   else departure_time = unixTime;
  // });

  // origin = 'נופר 14 רחובות ישראל';
  // origin = 'נחל נעמן 1 אשדוד ישראל';
  origin = 'פריחת הסמדר 9 גבעת עדה ישראל';
  destination = 'שלמה בן יוסף 32 תל אביב ישראל';
  // destination = 'אילת';
  departure_time = 1652853600;
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
   * The time it takes from point to point:
   * ((number of bus * bus time) + (number of bus * bus time) + .....) / 60
   * 
   * Average waiting time per point:
   * (number of buses * 2) / 60
   */

  routes.forEach((route) => {
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        console.log(step.duration);
        console.log(getFromStringTheNumberOfMinutes(step.duration.text));
      });
    });
  });

  console.log('----------------------------------------');
  console.log('\x1b[36m%s\x1b[0m', 'Final points:', points);
  console.log('----------------------------------------');
};

(async () => {
  const continueQuestions = [
    {
      type: 'list',
      name: 'continueGet',
      message: 'Do another calculation?',
      choices: ['continue', 'stop'],
    },
  ];

  let continueGet: boolean = true;

  main();

  // while (continueGet) {
  //   await main();

  //   await inquirer.prompt(continueQuestions).then((answers) => {
  //     if (answers.continueGet === 'stop') continueGet = false;
  //   });
  // }
})();
