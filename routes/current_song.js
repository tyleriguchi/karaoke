const uuid = require("uuid");
const uuidV4 = uuid.v4;
const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios"); // "Request" library

const spotify_redirect_uri = `${process.env.host}/authorize/spotify/callback`;

router.get("/", function(req, res, next) {
  const options = {
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    headers: { Authorization: `Bearer ${req.headers.token}` }
  };

  // use the access token to access the Spotify Web API
  console.log("before user me");
  axios.request(options).then(response => {
    console.log(response.data);
    res.send({
      data: response.data
    });
  });
});
