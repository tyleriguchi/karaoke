const uuid = require("uuid");
const uuidV4 = uuid.v4;
const express = require("express");
const router = express.Router();
const querystring = require("querystring");

/* GET home page. */
router.get("/spotify", function(req, res, next) {
  const scope = "user-read-private user-read-email";
  const state = uuidV4;

  const params = querystring.stringify({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: "localhost:3001/?authorized=true",
    state: state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

module.exports = router;
