"use client";


import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { createClient } from "@deepgram/sdk"; // Import Deepgram SDK

interface MicrophoneProps {
  apiKey: string;
}

const Microphone: React.FC<MicrophoneProps> = ({ apiKey }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const deepgramClientRef = useRef<ReturnType<typeof createClient> | null>(null);
  const deepgramLiveRef = useRef<WebSocket | null>(null); // Use WebSocket type for live transcription

  useEffect(() => {
    // Initialize Deepgram client
    deepgramClientRef.current = createClient(apiKey);

    // Cleanup function
    return () => {
      stopMicrophone();
    };
  }, [apiKey]);

  const startMicrophone = async () => {
    try {
      // Reset states
      setError(null);
      setTranscript('');

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Deepgram Live Transcription via WebSocket
      const deepgramSocketUrl = `wss://api.deepgram.com/v1/listen?access_token=${apiKey}`;
      deepgramLiveRef.current = new WebSocket(deepgramSocketUrl);

      deepgramLiveRef.current.onopen = () => {
        console.log('Deepgram connection opened');
      };

      deepgramLiveRef.current.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        const transcriptData = data.channel?.alternatives[0]?.transcript;
        if (transcriptData) {
          setTranscript((prev) => prev + (prev ? ' ' : '') + transcriptData);
        }
      };

      deepgramLiveRef.current.onerror = (event: Event) => {
        console.error('Deepgram WebSocket error:', event);
        setError('Transcription error occurred. Please try again.');
      };

      deepgramLiveRef.current.onclose = () => {
        console.log('Deepgram connection closed');
      };

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0 && deepgramLiveRef.current && deepgramLiveRef.current.readyState === WebSocket.OPEN) {
          deepgramLiveRef.current.send(event.data); // Send audio data to Deepgram
        }
      });

      recorder.start(250); // Send data every 250ms
      setIsListening(true);

    } catch (err) {
      console.error('Error starting microphone:', err);
      setError(`Failed to start microphone: ${(err as Error).message}`);
      stopMicrophone();
    }
  };

  const stopMicrophone = () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (deepgramLiveRef.current) {
        deepgramLiveRef.current.close();
        deepgramLiveRef.current = null;
      }

      setIsListening(false);
    } catch (err) {
      console.error('Error stopping microphone:', err);
      setError(`Failed to stop microphone: ${(err as Error).message}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Real-Time Voice to Text
        </Typography>

        <Button
          variant="contained"
          color={isListening ? 'error' : 'primary'}
          onClick={isListening ? stopMicrophone : startMicrophone}
          sx={{ mb: 3 }}
        >
          {isListening ? 'Stop Microphone' : 'Start Microphone'}
        </Button>

        {error && (
          <Typography 
            color="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Typography>
        )}

        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            minHeight: 100,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          <Typography variant="body1">
            {transcript || 'Your transcript will appear here...'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Microphone;