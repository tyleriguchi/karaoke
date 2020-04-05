const uuid = require("uuid");
const uuidV4 = uuid.v4;
const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios"); // "Request" library

const spotify_redirect_uri = `${process.env.host}/authorize/spotify/callback`;

router.get("/spotify", function(req, res, next) {
  const scope = "user-read-currently-playing";
  const state = uuidV4();

  res.cookie("spotify_uuid", state);

  const params = querystring.stringify({
    response_type: "code",
    client_id: process.env.spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get("/spotify/callback", function(req, res, next) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies["spotify_uuid"] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch"
        })
    );
  } else {
    res.clearCookie("spotify_uuid");
    const authHeaderData = Buffer.from(
      `${process.env.spotify_client_id}:${process.env.spotify_client_secret}`
    ).toString("base64");
    const requestOptions = {
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: querystring.stringify({
        code: code,
        redirect_uri: spotify_redirect_uri,
        grant_type: "authorization_code"
      }),
      headers: {
        Authorization: `Basic ${authHeaderData}`,
        "content-type": "application/x-www-form-urlencoded "
      }
    };

    console.log("before post");

    axios
      .request(requestOptions)
      .then(response => {
        console.log("response", response.status);
        if (response.status === 200) {
          // we can also pass the token to the browser to make requests from there
          res.status(200).send({
            data: {
              access_token: response.data.access_token,
              refresh_token: response.data.refresh_token
            }
          })
        } else {
          res.status(400).send(
            data: {
              error: "invalid_token"
            }
            "/#" +
              querystring.stringify({
                error: "invalid_token"
              })
          );
        }
      })
      .catch(err => {
        if (err && err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log("err: ", err);
        }
      });
  }
});
module.exports = router;
