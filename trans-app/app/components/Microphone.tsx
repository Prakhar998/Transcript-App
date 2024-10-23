"use client";

import React, { useState, useRef } from "react";
import { Button, Typography, Container, Box } from "@mui/material";

const Microphone: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Hardcoded API key
  const apiKey = "cdc5c164be59de697de43ba49e197667d852f955";  // Replace with your actual Deepgram API key

  // Start recording audio
  const startMicrophone = async () => {
    try {
      // Reset state
      setError(null);
      setTranscript("");
      setAudioChunks([]);

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm", // Adjust MIME type if needed
      });
      mediaRecorderRef.current = recorder;

      // Collect audio data chunks
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      recorder.start(); // Start recording
      setIsListening(true);
    } catch (err) {
      console.error("Error starting microphone:", err);
      setError(`Failed to start microphone: ${(err as Error).message}`);
      stopMicrophone();
    }
  };

  // Stop recording and upload audio for transcription
  const stopMicrophone = async () => {
    try {
      // Stop the recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setIsListening(false);

      // Process and upload audio
      await uploadAudioForTranscription();

    } catch (err) {
      console.error("Error stopping microphone:", err);
      setError(`Failed to stop microphone: ${(err as Error).message}`);
    }
  };

  // Upload the recorded audio to the transcription service
  const uploadAudioForTranscription = async () => {
    try {
      // Combine audio chunks into a single Blob
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      // Upload audio to transcription API
      const response = await fetch("https://api.deepgram.com/v1/listen", {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`, // Hardcoded API key
          "Content-Type": "audio/webm", // MIME type of the audio data
        },
        body: audioBlob, // Send the combined audio blob
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio for transcription");
      }

      const result = await response.json();

      const transcriptData = result.channel?.alternatives[0]?.transcript;

      if (transcriptData) {
        setTranscript(transcriptData); // Set the final transcript
      } else {
        setTranscript("No transcript available.");
      }

    } catch (error) {
      console.error("Error uploading audio:", error);
      setError("Failed to upload audio for transcription.");
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Batch Voice to Text Transcription
        </Typography>

        <Button
          variant="contained"
          color={isListening ? "error" : "primary"}
          onClick={isListening ? stopMicrophone : startMicrophone}
          sx={{ mb: 3 }}
        >
          {isListening ? "Stop Recording" : "Start Recording"}
        </Button>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
            minHeight: 100,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          <Typography variant="body1">
            {transcript || "Your transcript will appear here after uploading..."}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Microphone;
