const socket = io();
const statusDiv = document.getElementById("status");
const videoContainer = document.getElementById("videoContainer");
const roomIDInput = document.getElementById("roomID");
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const userIDInput = document.getElementById("UserID");
const userNameInput = document.getElementById("userName");
const notificationContainer = document.getElementById("notificationContainer");

const localVideo = document.getElementById("localVideo");
const peers = {};
let localStream;
let isVideoEnabled = true;
let isAudioEnabled = true;

const iceConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
    showNotification("Error accessing media devices.", "red");
  });

document.getElementById("createRoom").onclick = () => {
  const roomID = generateRoomID();
  roomIDInput.value = roomID;
  socket.emit("create-room", roomID, userIDInput.value, userNameInput.value);
};

document.getElementById("joinRoom").onclick = () => {
  const roomID = roomIDInput.value;
  if (!roomID) {
    showNotification("Room ID is required to join.", "red");
    return;
  }
  clearPeers();
  socket.emit("join-room", roomID, userIDInput.value, userNameInput.value);
};

document.getElementById("toggleVideo").onclick = () => {
  isVideoEnabled = !isVideoEnabled;
  localStream.getVideoTracks()[0].enabled = isVideoEnabled;
  showNotification(
    `Video ${isVideoEnabled ? "enabled" : "disabled"}`,
    "yellow"
  );
};

document.getElementById("toggleAudio").onclick = () => {
  isAudioEnabled = !isAudioEnabled;
  localStream.getAudioTracks()[0].enabled = isAudioEnabled;
  showNotification(`Audio ${isAudioEnabled ? "enabled" : "disabled"}`, "red");
};

document.getElementById("leaveRoom").onclick = () => {
  leaveRoom();
  showNotification("You have left the room.", "gray");
};

sendButton.onclick = () => {
  const message = chatInput.value;
  const roomID = roomIDInput.value;
  const userID = userIDInput.value;
  if (message.trim() && roomID) {
    socket.emit("chat-message", { roomID, userID ,message });
    chatInput.value = "";
    addMessageToChatBox("You", message);
  }
};

socket.on("chat-message", ({ sender, senderId, message }) => {
  const displayName = senderId === userIDInput.value ? "You" : sender;
  addMessageToChatBox(displayName, message);
});

socket.on("chat-history", (history) => {
  history.forEach(({ sender, senderId, message }) => {
    const displayName = senderId === userIDInput.value ? "You" : sender;
    addMessageToChatBox(displayName, message);
  });
});

socket.on("room-created", (roomID) => {
  showNotification(
    `Room ${roomID} created. Waiting for other users to join.`,
    "green"
  );
});

socket.on("room-joined", (roomID) => {
  showNotification(`Joined room ${roomID}.`, "green");
});

socket.on("user-connected", (user) => {
  showNotification(`User ${user.Socket_userName} joined the room.`, "blue");
  createPeerConnection(user.Socket_id, true);
});

socket.on("all-users", (users) => {
  users.forEach((user) => {
    createPeerConnection(user.Socket_id, false);
  });
});

socket.on("offer", async ({ offer, sender }) => {
  const pc = createPeerConnection(sender, false);
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  console.log("Sending answer to ", sender);
  socket.emit("answer", { target: sender, answer });
});

socket.on("answer", async ({ answer, sender }) => {
  const pc = peers[sender];
  console.log("Received answer from ", sender);
  if (pc) {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

socket.on("candidate", ({ candidate, sender }) => {
  const pc = peers[sender];
  console.log("Received ICE candidate from ", sender);
  if (pc) {
    pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) =>
      console.error("Error adding received ICE candidate", e)
    );
  }
});

socket.on("user-left", (userID) => {
  showNotification(`User ${userID.Socket_userName} left the room.`, "red");
  removePeer(userID.Socket_id);
});

socket.on("forced-disconnect", () => {
  showNotification(
    "You have been removed from the room due to multiple logins.",
    "red"
  );
  leaveRoom();
});

function createPeerConnection(userID, isInitiator) {
  const pc = new RTCPeerConnection(iceConfiguration);
  peers[userID] = pc;

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", {
        target: userID,
        candidate: event.candidate,
      });
    }
  };

  pc.ontrack = (event) => {
    console.log(`Received remote track from ${userID}`);
    let remoteVideo = document.getElementById(`video-${userID}`);
    if (!remoteVideo) {
      remoteVideo = document.createElement("video");
      remoteVideo.id = `video-${userID}`;
      remoteVideo.autoplay = true;
      remoteVideo.classList.add("rounded", "shadow", "max-w-full");
      remoteVideo.srcObject = event.streams[0];
      videoContainer.appendChild(remoteVideo);
    } else {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === "disconnected") {
      console.log(`Disconnected from ${userID}`);
      removePeer(userID);
    }
  };

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  if (isInitiator) {
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: userID, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    };
  }

  return pc;
}

function leaveRoom() {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localVideo.srcObject = null;
  }

  for (const userID in peers) {
    removePeer(userID);
  }

  const roomID = roomIDInput.value;
  socket.emit("leave-room", roomID);
  showNotification("You have left the room.", "gray");

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

function removePeer(userID) {
  if (peers[userID]) {
    peers[userID].close();
    delete peers[userID];
  }
  const remoteVideo = document.getElementById(`video-${userID}`);
  if (remoteVideo) {
    remoteVideo.remove();
  }
}

function clearPeers() {
  for (const userID in peers) {
    removePeer(userID);
  }
}

function generateRoomID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function addMessageToChatBox(sender, message) {
  const messageElement = document.createElement("p");
  messageElement.textContent = `${sender}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showNotification(message, color) {
  const notification = document.createElement("div");
  notification.className = `bg-${color}-500 text-white p-2 rounded mb-2 shadow-lg`;
  notification.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <div class="relative w-full h-1 bg-${color}-300 mt-2">
        <div class="absolute top-0 left-0 h-1 bg-${color}-700 progress-bar"></div>
      </div>
    </div>
  `;
  notificationContainer.appendChild(notification);

  const progressBar = notification.querySelector(".progress-bar");
  progressBar.style.transition = "width 5s linear";
  setTimeout(() => {
    progressBar.style.width = "100%";
  }, 10);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
