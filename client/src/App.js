import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const App = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  const [audioBlob, setAudioBlob] = useState(null);
  // const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const delay = 300;

  const fetchAudio = async (text) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/speech", { text });

      if (response.status === 200) {
        setAudioBlob(response.data);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const useObjectUrl = (blob) => {
    const url = useMemo(
      () => (blob ? URL.createObjectURL(blob) : null),
      [blob]
    );

    useEffect(() => {
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }, [blob, url]);

    return url;
  };

  // const handleInputChange = (e) => {
  //   setText(e.target.value);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setWords(text.trim().split(" "));
    setCurrentWord("");
    setWordIndex(0);
    fetchAudio(text);
  };

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
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio
        .play()
        .then(() => {
          console.log("Audio is playing");
        })
        .catch((error) => {
          console.error("Audio play error:", error);
        });
    }
  }, [audioUrl]);
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
