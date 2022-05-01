import { Client, DirectionsRequest } from "@googlemaps/google-maps-services-js";
import axios from "axios";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const client = new Client();

const run = async () => {
  const axiosInstance = axios.create({
    baseURL: "https://some-domain.com/api/",
    timeout: 1000,
    headers: { "X-Custom-Header": "foobar" },
  });

  console.log(process.env.GOOGLE_MAPS_API_KEY);

  const directionsRequest: DirectionsRequest = {
    params: {
      origin: "Disneyland",
      destination: "Universal Studios",
      key: process.env.GOOGLE_MAPS_API_KEY || "",
    },
  };

  const x = await client.directions(directionsRequest);
  console.log(x);
};

run();

// client
//   .elevation({
//     params: {
//       locations: [{ lat: 45, lng: -110 }],
//       key: process.env.GOOGLE_MAPS_API_KEY || "NO-KEY",
//     },
//     timeout: 1000, // milliseconds
//   })
//   .then((r) => {
//     console.log(r.data.results[0].elevation);
//   })
//   .catch((e) => {
//     console.log(e);
//   });
