import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const App = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const delay = 300;

  axios.defaults.withCredentials = true;

  const fetchAudio = async (sentence) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "https://text-to-speech-api-liart.vercel.app/api/speech",
        { text: sentence },
        {
          responseType: "arraybuffer",
        }
      );
      console.log("Response:", response);

      if (response.status === 200) {
        const audioBlob = new Blob([response.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        playAudio(audioUrl);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const useObjectUrl = (blob) => {
    console.log("blob", blob);

    const url = useMemo(
      () => (blob ? URL.createObjectURL(blob) : null),
      [blob]
    );
    console.log("url is ", url);
    useEffect(() => {
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }, [blob, url]);

    return url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setWords(text.trim().split(" "));
    setCurrentWord("");
    setWordIndex(0);
    const sentenceArray = text
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    setSentences(sentenceArray);
    setCurrentSentenceIndex(0);
  };

  useEffect(() => {
    if (sentences.length > 0 && currentSentenceIndex < sentences.length) {
      fetchAudio(sentences[currentSentenceIndex]);
    }
  }, [currentSentenceIndex, sentences]);

  useEffect(() => {
    if (words.length > 0 && wordIndex < words.length) {
      console.log("Setting timeout for next word");
      const timer = setTimeout(() => {
        setCurrentWord(words[wordIndex]);
        setWordIndex(wordIndex + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [wordIndex, words]);

  const audioUrl = useObjectUrl(audioBlob);

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio
      .play()
      .then(() => {
        console.log("Audio is playing");
        audio.onended = () => {
          setCurrentSentenceIndex((prevIndex) => prevIndex + 1);
        };
      })
      .catch((error) => {
        console.error("Audio play error:", error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-950 text-white p-5">
      <h1 className="text-4xl font-bold mb-8">Text-to-Speech Streaming</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg"
      >
        <textarea
          placeholder="Enter your paragraph here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 mb-4"
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
        >
          Submit
        </button>
      </form>

      <div className="mt-12 flex items-center justify-center text-3xl font-semibold min-h-[50px]">
        {currentWord && <h2 className="animate-pulse">{currentWord}</h2>}
        {isLoading && <h2 className="animate-pulse">...</h2>}
      </div>
    </div>
  );
};

export default App;
