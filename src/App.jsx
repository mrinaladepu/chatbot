import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const apiKey = import.meta.env.VITE_GROQ_API_KEY; // or similar
  console.log("Groq API Key:", apiKey);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    // Prepare the chat history for Groq API
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
      ...updatedMessages,
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

      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
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

  return (
    <div className="chat-container">
      <h1 className="chat-title">👩‍⚕️ MediCare Assistant</h1>
      <p className="chat-subtitle">
        Ask health questions and get ethical, accurate guidance.
      </p>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
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
        <button onClick={handleSend}>Send</button>
      </div>

      <p className="chat-disclaimer">
        Disclaimer: This chatbot provides general information only. Always
        consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}

export default App;
