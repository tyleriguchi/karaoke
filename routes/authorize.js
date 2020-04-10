const uuid = require("uuid");
const uuidV4 = uuid.v4;
const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios"); // "Request" library
const cors = require("cors");
const spotify_redirect_uri = `${process.env.client_host}/auth/spotify`;

router.get("/spotify", function(req, res, next) {
  const scope = "user-read-currently-playing";
  const state = uuidV4();
  res.cookie("spotify_uuid", state);
  res.set("X-Auth-Spotify", state);
  console.log("state", state);
  console.log("cookie", res.cookies);
  const params = querystring.stringify({
    response_type: "code",
    client_id: process.env.spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  });

  console.log(
    "redirect link",
    `https://accounts.spotify.com/authorize?${params}`
  );

  res.header(
    "Access-Control-Expose-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Spotify"
  );

  res.status(200).json({
    data: {
      redirect_uri: `https://accounts.spotify.com/authorize?${params}`
    }
  });
});
module.exports = router;
