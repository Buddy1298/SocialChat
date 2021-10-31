import "dotenv/config";
import connectFlash from "connect-flash";
import cookieParse from "cookie-parser";
import events from "events";
import express from "express";
import http from "http";
import passport from "passport";
import socketio from "socket.io";
import * as configApp from "./config/app";
import connectDB from "./config/connectDB";
import * as session from "./config/session";
import configSocketio from "./config/socketio";
import configViewEngine from "./config/viewEngine";
import initRoutes from "./routes/web";
import initSockets from "./sockets";
// import pem from "pem";
// import https from 'https';

// Init app
const app = express();

// Set max connection event listener
events.EventEmitter.defaultMaxListeners = configApp.app.max_event_listeners;

// Init server with socket.io & express app
const server = http.createServer(app);
const io = socketio(server);

// Connect to MongoDB
connectDB();

// Config session
session.config(app);

// Config view engine
configViewEngine(app);

// Enable post data for request
app.use(express.urlencoded({ extended: true }));

// Enable flash messages
app.use(connectFlash());

// Use Cookie Parse
app.use(cookieParse());

// Config passport
app.use(passport.initialize());
app.use(passport.session());

// Init all routes
initRoutes(app);

// Config for socket.io
configSocketio(io, cookieParse, session.sessionStore);

// Init all socket
initSockets(io);

server.listen(process.env.APP_PORT, process.env.APP_HOSTNAME, () => {
  console.log(
    `App listening at http://${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`
  );
});

// pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
//   if (err) {
//     throw err;
//   }

//   // Init app
//   const app = express();

//   // Set max connection event listener
//   events.EventEmitter.defaultMaxListeners = configApp.app.max_event_listeners;

//   // Init server with socket.io & express app
//   const server = http.createServer(app);
//   const io = socketio(server);

//   // Connect to MongoDB
//   connectDB();

//   // Config session
//   session.config(app);

//   // Config view engine
//   configViewEngine(app);

//   // Enable post data for request
//   app.use(express.urlencoded({ extended: true }));

//   // Enable flash messages
//   app.use(connectFlash());

//   // Use Cookie Parse
//   app.use(cookieParse());

//   // Config passport
//   app.use(passport.initialize());
//   app.use(passport.session());

//   // Init all routes
//   initRoutes(app);

//   // Config for socket.io
//   configSocketio(io, cookieParse, session.sessionStore);

//   // Init all socket
//   initSockets(io);

//   // server.listen(process.env.APP_PORT, process.env.APP_HOSTNAME, () => {
//   //   console.log(
//   //     `App listening at http://${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`
//   //   );
//   // });

//   https
//     .createServer({ key: keys.serviceKey, cert: keys.certificate }, app)
//     .listen(process.env.APP_PORT);
// });
