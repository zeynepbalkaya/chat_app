const socket = io("ws://localhost:3500");
const userMessageInput = document.querySelector("#message");
const userNameInput = document.querySelector("#name");
const selectedRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const onlineUsersList = document.querySelector(".user-list");
const activeRoomsList = document.querySelector(".room-list");
const messageDisplay = document.querySelector(".chat-display");

function userSendMessage(e) {
  e.preventDefault();
  if (userNameInput.value && userMessageInput.value && selectedRoom.value) {
    socket.emit("message", {
      name: userNameInput.value,
      text: userMessageInput.value,
    });
    userMessageInput.value = "";
  }
  userMessageInput.focus();
}

function joinChatRoom(e) {
  e.preventDefault();

  const userName = userNameInput.value.trim();

  if (userNameInput.value && selectedRoom.value) {
    socket.emit("enterRoom", {
      name: userNameInput.value,
      room: selectedRoom.value,
    });
  }
}

document.querySelector(".form-msg").addEventListener("submit", userSendMessage);

document.querySelector(".form-join").addEventListener("submit", joinChatRoom);

userMessageInput.addEventListener("keypress", () => {
  socket.emit("activity", userNameInput.value);
});

// Listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  if (name === userNameInput.value) li.className = "post post--left";
  if (name !== userNameInput.value && name !== "Admin")
    li.className = "post post--right";
  if (name !== "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === userNameInput.value
        ? "post__header--user"
        : "post__header--reply"
    }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }
  document.querySelector(".chat-display").appendChild(li);

  messageDisplay.scrollTop = messageDisplay.scrollHeight;
});

let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  // Clear after 3 seconds
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("activeRoomsList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  onlineUsersList.textContent = "";
  if (users) {
    onlineUsersList.innerHTML = `<em>Users in ${selectedRoom.value}:</em>`;
    users.forEach((user, i) => {
      onlineUsersList.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        onlineUsersList.textContent += ",";
      }
    });
  }
}

function showRooms(rooms) {
  activeRoomsList.textContent = "";
  if (rooms) {
    activeRoomsList.innerHTML = "<em>Active Rooms:</em>";
    rooms.forEach((room, i) => {
      activeRoomsList.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        activeRoomsList.textContent += ",";
      }
    });
  }
}
