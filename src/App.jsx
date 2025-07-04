import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ You can replace this with import.meta.env if using .env setup
  const apiKey = "gsk_XXXXXXXXXXXXXXXXXXXXXXXX";

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const pairId = Date.now(); // unique pair ID to match user/bot
    const userMsg = {
      role: "user",
      content: text,
      editable: false,
      pairId,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    await generateBotReply(updatedMessages, pairId);
  };

  const generateBotReply = async (chatSoFar, pairId) => {
    const chatHistory = [
      {
        role: "system",
        content: `You are a helpful medical assistant. 
Always provide medically accurate and ethical responses. 
If unsure, say so. Never give prescriptions.

🔹 When explaining steps or tips, always present them as **numbered or bullet points**, not in paragraphs.

🔹 Use formatting like bold headings, line breaks, and short sentences to improve clarity.

🔹 End every answer with a friendly reminder and a medical disclaimer.`,
      },
      ...chatSoFar.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: chatHistory,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply =
        res.data.choices[0].message.content +
        "\n\n⚠️ This is general information. Consult a licensed doctor for medical advice.";

      const botMsg = {
        role: "bot",
        content: reply,
        liked: null,
        pairId,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error talking to Groq:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, there was a problem connecting to the medical assistant. Please try again later.",
        },
      ]);
    }
  };

  const toggleEdit = (index, value) => {
    const updated = [...messages];
    updated[index].editable = value;
    setMessages(updated);
  };

  const handleEditChange = (index, newText) => {
    const updated = [...messages];
    updated[index].content = newText;
    setMessages(updated);
  };

  const handleEditFinish = async (index) => {
    const newMessages = [...messages];
    const editedMessage = newMessages[index];
    editedMessage.editable = false;

    const cleanedMessages = newMessages.filter(
      (msg, i) =>
        i === index || !(msg.role === "bot" && msg.pairId === editedMessage.pairId)
    );

    setMessages(cleanedMessages);

    // ✅ Wait 1 tick to ensure state updates before using it
    setTimeout(() => {
      generateBotReply(cleanedMessages, editedMessage.pairId);
    }, 0);
  };

  const handleLike = (index, value) => {
    const updated = [...messages];
    updated[index].liked = value;
    setMessages(updated);
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">👩‍⚕️ MediCare Assistant</h1>
      <p className="chat-subtitle">
        Ask health questions and get ethical, accurate guidance.
      </p>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.role === "user" ? (
              <>
                {msg.editable ? (
                  <input
                    className="edit-input"
                    value={msg.content}
                    onChange={(e) => handleEditChange(index, e.target.value)}
                    onBlur={() => handleEditFinish(index)}
                    autoFocus
                  />
                ) : (
                  <div className="message-content">
                    <strong>You:</strong> {msg.content}
                  </div>
                )}
                <div className="user-actions">
                  <button
                    onClick={() => toggleEdit(index, true)}
                    title="Edit"
                    className="edit-button"
                  >
                    ✏️
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="message-content">
                  <strong>Bot:</strong> {msg.content}
                </div>
                <div className="bot-actions">
                  <button
                    className={msg.liked === true ? "liked" : ""}
                    onClick={() => handleLike(index, true)}
                    title="Like"
                  >
                    👍
                  </button>
                  <button
                    className={msg.liked === false ? "disliked" : ""}
                    onClick={() => handleLike(index, false)}
                    title="Dislike"
                  >
                    👎
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type your medical question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>

      <p className="chat-disclaimer">
        Disclaimer: This chatbot provides general information only. Always consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}

export default App;
