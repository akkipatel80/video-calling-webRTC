var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// var io = new server();
var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);
app.use("/users", usersRouter);

const server = require("http")
  .createServer(app)
  .listen(8000, () => {
    console.log("app running on : ", 8000);
  });
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();
console.log("first");
const cors_urls = ["http://localhost:3000/", "http://192.168.29.191:3000/"];

const io = require("socket.io")(server, {
  cors: (cors, callback) => {
    // console.log(cors.headers, "cors.headers");
    if (cors_urls.includes(cors.headers["origin"])) {
      callback(null, { origin: true, credentials: false });
    } else {
      callback(null, { origin: true, credentials: false });
      // callback("Not allowed by CORS");
    }
  },
});
io.on("connection", (socket) => {
  console.log("New connection");
  socket.on("room-join", (data) => {
    const { roomId, emailId } = data;
    console.log("user", emailId, "joined room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    io.to(roomId).emit("user-joined", { emailId, roomId });
    socket.join(roomId);
    io.to(socket.id).emit("joined-room", { roomId });
  });
  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    console.log("call from", emailId);
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    io.to(socketId).emit("incoming-call", { from: fromEmail, offer });
  });
  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    const socketId = emailToSocketMapping.get(emailId);
    const fromEmail = socketToEmailMapping.get(socket.id);
    console.log("call accepted from ", emailId);
    io.to(socketId).emit("call-accepted", { from: fromEmail, ans });
  });
  socket.on("nego:needed", ({ emailId, offer }) => {
    console.log("nego:needed", offer);
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    io.to(socketId).emit("nego:needed", { from: fromEmail, offer });
  });
  socket.on("nego:done", ({ to, ans }) => {
    console.log("nego:done", ans);
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(to);
    io.to(socketId).emit("nego:final", { from: fromEmail, ans });
  });
});

module.exports = app;
