const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios"); // "Request" library
const cheerio = require("cheerio");

router.get("/", function(req, res, next) {
  axios
    .request({
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: { Authorization: `${req.headers.authorization}` }
    })
    .then(spotifyResponse => {
      const trackName = spotifyResponse.data.item.name;
      const artistNames = spotifyResponse.data.item.artists
        .map(artist => artist.name)
        .join(" ");

      const params = querystring.stringify({
        q: `${trackName} ${artistNames}`
      });

      console.log("params", params);

      const options = {
        url: `https://api.genius.com/search?${params}`,
        headers: {
          Authorization: `Bearer ${process.env.lyric_genius_client_token}`
        }
      };

      axios
        .request(options)
        .then(response => {
          const possibleMatch = response.data.response.hits;

          if (possibleMatch.length) {
            const mostLikelyMatch = possibleMatch[0].result;

            axios
              .request({ url: mostLikelyMatch.url })
              .then(lyricGeniusResponse => {
                const $ = cheerio.load(lyricGeniusResponse.data);

                const lyrics = $(".lyrics").text();

                res.send({
                  data: {
                    lyrics,
                    url: mostLikelyMatch.url,
                    song_title: mostLikelyMatch.title_with_featured,
                    primary_artist: mostLikelyMatch.primary_artist.name
                  }
                });
              });
          }
        })
        .catch(err => {
          console.log("err", err);
        });
    })
    .catch(err => {
      console.log("err", err);
    });
});

module.exports = router;
