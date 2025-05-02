const express = require("express");
const path = require("path");
const axios = require("axios");
require('dotenv').config()
const routes = require('./routes/ttsRoutes')
const app = express();
const PORT = 2000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes)
// Routes
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://ai-text-to-voice.onrender.com/get/voices");
    
     // Log the response
    
    // Check if the structure is what you expect
    if (!response.data || !response.data.idWithName) {
      console.error("No voices data found");
      return res.status(500).send("No voices data found.");
    }

    res.render("index", { voices: response.data.idWithName, audioUrl: null });
  } catch (err) {
    console.error("Error fetching voices:", err.response || err);
    res.status(500).send("Failed to fetch voices.");
  }
});

app.post("/generate", async (req, res) => {
  const { text, voiceId } = req.body;
  try {
    const response = await axios.post(
      "https://ai-text-to-voice.onrender.com/convert/text-to-voice",
      { text, voiceId },
      { responseType: "arraybuffer" } // important for binary response
    );

    const audioBuffer = Buffer.from(response.data, "binary");
    const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

    const voicesRes = await axios.get("https://ai-text-to-voice.onrender.com/get/voices");
    
    if (!voicesRes.data || !voicesRes.data.idWithName) {
      console.error("No voices data found");
      return res.status(500).send("No voices data found.");
    }

    res.render("index", { voices: voicesRes.data.idWithName, audioUrl });
  } catch (err) {
    console.error("Error generating voice:", err.response || err);
    res.status(500).send("Failed to generate audio.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
