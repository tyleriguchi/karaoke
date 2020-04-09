const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios"); // "Request" library
const cheerio = require("cheerio");

router.get("/", function(req, res, next) {
  // const options = {
  //   url: "https://api.spotify.com/v1/me/player/currently-playing",
  //   headers: { Authorization: `${req.headers.authorization}` }
  // };
  //
  // // use the access token to access the Spotify Web API
  // console.log("before user me", req.headers);
  // axios
  //   .request(options)
  //   .then(response => {
  //     console.log(response.data);
  //     res.send({
  //       data: response.data
  //     });
  //   })
  //   .catch(err => {
  //     console.log("err", err);
  //   });
  const options = {
    url: "https://api.genius.com/search?q=Kendrick%20Lamar",
    headers: {
      Authorization: `Bearer ${process.env.lyric_genius_client_token}`
    }
  };

  axios
    .request(options)
    .then(response => {
      console.log(response.data.response.hits);
      const most_likely_match = response.data.response.hits[0];

      axios
        .request({ url: most_likely_match.path })
        .then(lyric_genius_response => {
          const $ = cheerio.load(lyric_genius_response.data);

          const text = $(".lyrics").text();
          console.log("extracted lyrics", text);

          res.send({
            data: text
          });
        });
    })
    .catch(err => {
      console.log("err", err);
    });
});

module.exports = router;
