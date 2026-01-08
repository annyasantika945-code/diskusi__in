import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =========================
   FIREBASE CONFIG (PUNYA KAMU – TIDAK DIUBAH)
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyDOgu8RbtRmROhraUB7Nl1mJ41nAirxVk4",
  authDomain: "diskusi-in.firebaseapp.com",
  databaseURL: "https://diskusi-in-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diskusi-in",
  storageBucket: "diskusi-in.firebasestorage.app",
  messagingSenderId: "823851958982",
  appId: "1:823851958982:web:5192dccfabdf69e83e8dc7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   VAR DASAR (PUNYA KAMU)
========================= */
const username = localStorage.getItem("username");
const chatBox = document.getElementById("chatBox");
const messagesRef = ref(db, "messages");

/* =========================
   FITUR ONLINE USER
========================= */
const usersRef = ref(db, "onlineUsers/" + username);

// tandai user online
set(usersRef, {
  name: username,
  online: true
});

// auto offline saat keluar / refresh
onDisconnect(usersRef).remove();

/* =========================
   TAMPILKAN JUMLAH USER ONLINE
========================= */
const header = document.querySelector(".header");
const onlineInfo = document.createElement("div");
onlineInfo.className = "online-info";
header.appendChild(onlineInfo);

onValue(ref(db, "onlineUsers"), (snapshot) => {
  const users = snapshot.val();
  const count = users ? Object.keys(users).length : 0;
  onlineInfo.innerText = `${count} online`;
});

/* =========================
   SYSTEM MESSAGE: USER BERGABUNG
========================= */
push(messagesRef, {
  system: true,
  text: `${username} bergabung`,
  time: Date.now()
});

/* =========================
   KIRIM PESAN (PUNYA KAMU – TETAP)
========================= */
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const text = messageInput.value.trim();
  if (text === "") return;

  push(messagesRef, {
    user: username,
    text: text,
    time: Date.now()
  });

  messageInput.value = "";
};

/* =========================
   TERIMA PESAN (DITAMBAH FITUR)
========================= */
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();

  /* ===== SYSTEM MESSAGE ===== */
  if (data.system) {
    const sys = document.createElement("div");
    sys.className = "system-message";
    sys.innerText = data.text;
    chatBox.appendChild(sys);
    chatBox.scrollTop = chatBox.scrollHeight;
    return;
  }

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");

  // kiri / kanan
  if (data.user === username) {
    bubble.classList.add("chat-right");
  } else {
    bubble.classList.add("chat-left");
  }

  /* ===== USER + STATUS ===== */
  const userRow = document.createElement("div");
  userRow.className = "chat-user";

  const dot = document.createElement("span");
  dot.className = "status-dot";

  const name = document.createElement("span");
  name.innerText = data.user;

  userRow.appendChild(dot);
  userRow.appendChild(name);

  /* ===== ISI PESAN ===== */
  const messageText = document.createElement("div");
  messageText.innerText = data.text;

  /* ===== JAM PESAN ===== */
  const time = document.createElement("div");
  time.className = "chat-time";

  if (data.time) {
    const date = new Date(data.time);
    time.innerText =
      date.getHours().toString().padStart(2, "0") + ":" +
      date.getMinutes().toString().padStart(2, "0");
  }

  bubble.appendChild(userRow);
  bubble.appendChild(messageText);
  bubble.appendChild(time);

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
});

/* =========================
   LOGOUT BUTTON
========================= */
const logoutBtn = document.createElement("button");
logoutBtn.className = "logout-btn";
logoutBtn.innerText = "Keluar";

logoutBtn.onclick = () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
};

header.appendChild(logoutBtn);
