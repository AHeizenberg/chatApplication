let socket = io();
let nick_name;
let color;
//connected to server
socket.on("connect", () => {
  console.log("Connected to server.");
});

// disconnected from the server
socket.on("disconnect", () => {
  console.log("Disconnected to server.");
});

// receving messages
socket.on("chat-history", (message) => {
  // const formattedTime = moment(msg.createdAt).format("LTS");

  for (let msg of message) {
    let li = document.createElement("li");

    let time_span = document.createElement("span");
    time_span.innerText = msg.timestamp + " ";

    let user_span = document.createElement("span");
    user_span.style.color = msg.color;
    user_span.innerText = msg.user + ": ";

    let text_span = document.createElement("span");
    text_span.innerText = msg.text;

    li.appendChild(time_span);
    li.appendChild(user_span);
    li.appendChild(text_span);

    document.getElementById("messages-container").appendChild(li);

    document
      .querySelector("#messages-container")
      .lastElementChild.scrollIntoView();
  }
});

// receving messages
socket.on("newMessage", (msg) => {
  // const formattedTime = moment(msg.createdAt).format("LTS");

  console.log("newMessage", msg);

  let li = document.createElement("li");

  let time_span = document.createElement("span");
  time_span.innerText = msg.timestamp + " ";

  let user_span = document.createElement("span");
  user_span.style.color = msg.color;
  user_span.innerText = msg.user + ": ";

  let text_span = document.createElement("span");
  text_span.innerText = msg.text;

  li.appendChild(time_span);
  li.appendChild(user_span);
  li.appendChild(text_span);

  if (msg.user === nick_name) {
    li.style.fontWeight = "bold";
  }

  document.getElementById("messages-container").appendChild(li);

  document
    .querySelector("#messages-container")
    .lastElementChild.scrollIntoView();
});

document.querySelector("#Enter-btn").addEventListener("click", function (e) {
  e.preventDefault();
  color = document.getElementById("color").value;
  let temp_name = document.getElementById("name").value;

  // document.getElementById("login-footer").style.display = "none";
  // document.getElementById("footer").style.display = "flex";

  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-screen").style.display = "flex";

  socket.emit("newUser", temp_name);
});

socket.on("name-confirmation", (user_name) => {
  nick_name = user_name;
});

socket.on("good-name", (msg) => {
  let li = document.createElement("li");

  let user_span = document.createElement("span");
  user_span.style.color = "#008000";
  user_span.innerText = msg;

  li.appendChild(user_span);
  document.getElementById("messages-container").appendChild(li);
});

socket.on("duplicate-name", (msg) => {
  let li = document.createElement("li");
  let user_span = document.createElement("span");
  user_span.style.color = "#FF0000";
  user_span.innerText = msg;

  li.appendChild(user_span);
  document.getElementById("messages-container").appendChild(li);
});

socket.on("online-users", (active_users) => {
  let list = document.getElementById("online-users-container");

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  for (let user of active_users) {
    let li = document.createElement("li");
    li.innerText = user.user_name;

    document.getElementById("online-users-container").appendChild(li);
  }
});

socket.on("welcome-msg", (welcome_msg) => {
  let li = document.createElement("li");
  li.innerText = welcome_msg;

  document.getElementById("messages-container").appendChild(li);
});

socket.on("user-joined", (join_msg) => {
  let li = document.createElement("li");
  li.innerText = join_msg;

  document.getElementById("messages-container").appendChild(li);
});

socket.on("user-exit-message", (exit_msg) => {
  let li = document.createElement("li");
  li.innerText = exit_msg;

  document.getElementById("messages-container").appendChild(li);
});

document.querySelector("#submit-btn").addEventListener("click", function (e) {
  e.preventDefault();
  let input = document.getElementById("text-area");
  let pattern = /(\/nick [a-z0-9]+|\/nickcolor #([0-9a-f]){6})/i;

  if (!(input.value.match(pattern) === null)) {
    if (input.value.includes("/nickcolor")) {
      color = input.value.split(" ")[1];

      let li = document.createElement("li");
      let user_span = document.createElement("span");
      user_span.style.color = color;
      user_span.innerText = "User name color changed";

      li.appendChild(user_span);
      document.getElementById("messages-container").appendChild(li);

      //
    } else if (input.value.includes("/nick")) {
      let temp_name = input.value.split(" ")[1];
      socket.emit("nameChange", {
        new_name: temp_name,
        old_name: nick_name,
      });
    }
    input.value = "";
  } else {
    if (input.value) {
      socket.emit("createMessage", {
        text: document.querySelector('input[name="message"]').value,
        user: nick_name,
        color: color,
      });
      input.value = "";
    }
  }
});
