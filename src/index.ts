import { Client } from "@googlemaps/google-maps-services-js";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const client = new Client({});

console.log(process.env.GOOGLE_MAPS_API_KEY);

client
  .elevation(
    {
      params: {
        locations: [{ lat: 45, lng: -110 }],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    },
    axiosInstance
  )
  .then((r) => {
    console.log(r.data.results[0].elevation);
  })
  .catch((e) => {
    console.log(e);
  });
