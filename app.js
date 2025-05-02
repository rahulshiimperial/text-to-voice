const express = require("express");
const path = require("path");

const app = express();
const PORT = 2000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fix for node-fetch ES module
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Routes
app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://ai-text-to-voice.onrender.com/get/voices"
    );
    const data = await response.json();
    res.render("index", { voices: data.idWithName, audioUrl: null });
  } catch (err) {
    console.error("Error fetching voices:", err);
    res.status(500).send("Failed to fetch voices.");
  }
});

app.post("/generate", async (req, res) => {
  const { text, voiceId } = req.body;
  try {
    const response = await fetch(
      "https://ai-text-to-voice.onrender.com/convert/text-to-voice",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      }
    );

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

    const voicesRes = await fetch(
      "https://ai-text-to-voice.onrender.com/get/voices"
    );
    const voicesData = await voicesRes.json();

    res.render("index", { voices: voicesData.idWithName, audioUrl });
  } catch (err) {
    console.error("Error generating voice:", err);
    res.status(500).send("Failed to generate audio.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
