const uuid = require("uuid");
const uuidV4 = uuid.v4;
const express = require("express");
const router = express.Router();
const querystring = require("querystring");

const spotify_redirect_uri =
  "https://karoke.herokuapp.com/authorize/spotify/callback";
router.get("/spotify", function(req, res, next) {
  const scope = "user-read-private user-read-email";
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
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: spotify_redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(
            process.env.spotify_client_id +
              ":" +
              process.env.spotify_client_secret
          ).toString("base64")
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
        );
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token"
            })
        );
      }
    });
  }
});
module.exports = router;
