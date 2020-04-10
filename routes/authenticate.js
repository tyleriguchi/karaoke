const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
const spotify_redirect_uri = `${process.env.client_host}/auth/spotify`;

router.post("/spotify/", function(req, res, next) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies["spotify_uuid"] : null;
  console.log("state", state);
  console.log("stored state", storedState);
  if (state === null || state !== storedState) {
    res.status(422).send({
      data: {
        message: "state mismatch"
      }
    });
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
          const params = querystring.stringify({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
          });

          res.send({
            data: {
              token: `${process.env.client_host}?${params}`
            }
          });
        } else {
          res.status(422).send({
            data: {
              message: `${process.env.client_host}?error="invalid_token"`
            }
          });
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
