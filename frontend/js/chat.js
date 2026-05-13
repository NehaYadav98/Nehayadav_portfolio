const chatBox = document.getElementById("chatMessages");
const inputField = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");

function addMessage(message, sender) {

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.marginBottom = "16px";
  row.style.justifyContent =
    sender === "user" ? "flex-end" : "flex-start";

  const bubble = document.createElement("div");

  bubble.style.padding = "14px 16px";
  bubble.style.borderRadius = "16px";
  bubble.style.maxWidth = "75%";
  bubble.style.fontSize = "15px";
  bubble.style.lineHeight = "1.5";
  bubble.style.wordBreak = "break-word";

  if (sender === "user") {
    bubble.style.background = "#ffffff";
    bubble.style.color = "#000";
  } else {
    bubble.style.background = "#2f2f2f";
    bubble.style.color = "#fff";
  }

  bubble.innerText = message;

  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {

  const message = inputField.value.trim();

  if (!message) return;

  addMessage(message, "user");

  inputField.value = "";

  try {

    const response = await fetch("http://127.0.0.1:8000/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    question: message,
  }),
});

    const data = await response.json();

    addMessage(data.answer, "bot");

  } catch (error) {

    addMessage("Server error. Try again.", "bot");
    console.error(error);

  }
}

sendBtn.addEventListener("click", sendMessage);

inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

