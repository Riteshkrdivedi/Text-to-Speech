const express = require("express");
const cors = require("cors");
// const fs = require("fs");
const { createClient } = require("@deepgram/sdk");
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: "https://text-to-speech-client.vercel.app/",
  methods: ["POST", "GET"],
  credentials: true,
};
app.use(cors(corsOptions));

// app.use(cors());
app.use(express.json());
const port = process.env.port || 5000;

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.get("/", async (req, res) => {
  res.json("hello");
});

app.post(
  "https://text-to-speech-client.vercel.app/api/speech",
  async (req, res) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      const response = await deepgram.speak.request(
        { text },
        {
          model: "aura-asteria-en",
          encoding: "linear16",
          container: "wav",
        }
      );

      const stream = await response.getStream();

      if (stream) {
        const buffer = await getAudioBuffer(stream);

        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", buffer.length);

        res.send(buffer);
      } else {
        res.status(500).json({ error: "Error generating audio" });
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ error: "Failed to convert text to speech" });
    }
  }
);

const getAudioBuffer = async (response) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return Buffer.from(dataArray.buffer);
};

app.listen(port, () => {
  console.log("Server is running on port 5000");
});
