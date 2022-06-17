const express = require("express");
const moment = require("moment");
const { faker } = require("@faker-js/faker");

const path = require("path");
const publicPath = path.join(__dirname, "/../public");
const app = express();
app.use("/static", express.static(publicPath));

const http = require("http");

const port = process.env.PORT || 3000;
let server = http.createServer(app);
const io = require("socket.io")(server);

let chat_log = [];

let active_users = [];

// app.get("/", (req, res) => {
//   res.sendFile(publicPath + "/index.html");
// });

app.get("/", (req, res) => {
  res.sendFile(publicPath + "/index.html");
});

// Incoming web socket connect
io.on("connection", (socket) => {
  console.log("New user connected");

  // Sending chat log to client
  socket.emit("chat-history", chat_log);

  socket.emit(
    "welcome-msg",
    moment().format("LTS").toString() + " Welcome to the chat app! "
  );

  socket.on("newUser", (user) => {
    user = user.trim();

    let duplicate = false;
    let temp_name;
    for (let i = 0; i < active_users.length; i++) {
      if (active_users[i].user_name == user) {
        duplicate = true;
        break;
      }
    }
    if (duplicate == false && user.length > 0) {
      temp_name = user;
    } else {
      temp_name = faker.internet.userName();
    }

    active_users.push({
      user_name: temp_name,
      socket_id: socket.id,
    });
    io.to(socket.id).emit("name-confirmation", temp_name);
    io.emit("online-users", active_users);

    // Sending a message to all the sockets
    // except the one socket we have currently
    socket.broadcast.emit(
      "user-joined",
      moment().format("LTS").toString() + " " + temp_name + ": joined the room!"
    );
  });

  // Getting the message from the user
  socket.on("createMessage", (msg) => {
    console.log("CreatedMessage", msg);

    // let send_str = moment().format("LTS").toString() + " " + msg.text;

    let msg_obj = {
      user: msg.user,
      text: msg.text,
      color: msg.color,
      timestamp: moment().format("LTS").toString(),
    };

    chat_log.push(msg_obj);
    // time_log.push(curr_time);
    // user_log.push(curr_time);

    io.emit("newMessage", msg_obj);
  });

  socket.on("nameChange", (msg) => {
    let duplicate = false;
    let temp_name;
    for (let i = 0; i < active_users.length; i++) {
      if (active_users[i].user_name == msg.new_name) {
        duplicate = true;
        break;
      }
    }
    if (duplicate == false) {
      temp_name = msg.new_name;
      io.to(socket.id).emit("good-name", "Name changed to " + temp_name);
    } else {
      temp_name = msg.old_name;
      io.to(socket.id).emit(
        "duplicate-name",
        msg.new_name + " is already in use, choose another name!"
      );
    }

    for (let i = 0; i < active_users.length; i++) {
      if (active_users[i].user_name == msg.old_name) {
        active_users[i].user_name = temp_name;
      }
    }

    io.to(socket.id).emit("name-confirmation", temp_name);
    io.emit("online-users", active_users);
  });

  // Socket disconneting
  socket.on("disconnect", () => {
    console.log("A User disconnected from server.");

    var leavingUser = active_users.filter(
      (user) => user.socket_id === socket.id
    )[0];

    console.log(leavingUser);

    active_users = active_users.filter(
      (user) => !(user.socket_id === socket.id)
    );

    io.emit("online-users", active_users);

    if (!(leavingUser === undefined)) {
      socket.broadcast.emit(
        "user-exit-message",
        moment().format("LTS").toString() +
          " " +
          leavingUser.user_name +
          ": has left the room!"
      );
    }
  });
});

io.on("disconnect", () => {
  console.log("User disconnected.");
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
