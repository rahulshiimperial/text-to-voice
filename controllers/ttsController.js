const { ElevenLabsClient } = require("elevenlabs");


var elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function streamToBuffer(readableStream) {
    const reader = readableStream.getReader();
    const chunks = [];
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  
    return Buffer.concat(chunks);
  }
  

exports.getVoiceIds = async (req, res) => {
  try {
    const voices = await elevenlabs.voices.getAll();

    const idWithName = voices.voices.map((voice) => ({
      voiceId: voice.voice_id,
      name: voice.name,
    }));
    res.status(200).json({
      status: "success",
      idWithName,
      // voices,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err || "server error",
    });
  }
};

exports.tts = async (req, res) => {
  try {
    const { voiceId, text } = req.body;
    // console.log(req.body)
    if (!voiceId || !text) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }
    const stream = await elevenlabs.generate({
      voice: voiceId,
      text,
      model_id: "eleven_monolingual_v1",
    });
  
      const audio = await streamToBuffer(stream);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="voice.mp3"',
    });

    res.send(audio);
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err?.message || err?.toString() || "Internal Server Error",
    });
  }
};
