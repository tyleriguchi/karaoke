var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const corsOptions = {};

if (process.env.NODE_ENV !== "production") {
  // load environment variables
  require("dotenv").config();
} else {
  corsOptions["origin"] = process.env.client_host;
  corsOptions["credentials"] = true;
  corsOPtions["exposedHeaders"] =
    "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Spotify";
}
var indexRouter = require("./routes/index");
var authorizationRouter = require("./routes/authorize");
var currentSongRouter = require("./routes/current_song");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors(corsOptions));

app.use("/", indexRouter);
app.use("/authorize", authorizationRouter);
app.use("/current_song", currentSongRouter);

module.exports = app;
