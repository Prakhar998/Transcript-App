"use client";

import React, { useState, useRef } from 'react';

interface TranscriptionResult {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
      }>;
    }>;
  };
}

const Microphone: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Replace this with your actual API key
  const apiKey = 'cdc5c164be59de697de43ba49e197667d852f955';

  const logDebugInfo = (message: string): void => {
    setDebugInfo(prev => `${new Date().toISOString()}: ${message}\n${prev}`);
    console.log(message);
  };

  const startMicrophone = async (): Promise<void> => {
    try {
      setError(null);
      setTranscript('');
      setAudioChunks([]);
      logDebugInfo('Requesting microphone access...');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1    // Mono audio
        }
      });
      
      streamRef.current = stream;
      logDebugInfo('Microphone access granted');

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = recorder;
      logDebugInfo('MediaRecorder initialized');

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
          logDebugInfo(`Received audio chunk: ${event.data.size} bytes`);
        }
      };

      recorder.start(1000); // Collect chunks every second
      setIsListening(true);
      logDebugInfo('Recording started');
      
    } catch (err) {
      const errorMessage = `Microphone error: ${err instanceof Error ? err.message : String(err)}`;
      logDebugInfo(errorMessage);
      setError(errorMessage);
      stopMicrophone();
    }
  };

  const stopMicrophone = async (): Promise<void> => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        logDebugInfo('Stopping recording...');
        mediaRecorderRef.current.stop();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            logDebugInfo(`Stopped audio track: ${track.kind}`);
          });
        }
      }

      setIsListening(false);
      await uploadAudioForTranscription();
      
    } catch (err) {
      const errorMessage = `Stop recording error: ${err instanceof Error ? err.message : String(err)}`;
      logDebugInfo(errorMessage);
      setError(errorMessage);
    }
  };

  const uploadAudioForTranscription = async (): Promise<void> => {
    if (audioChunks.length === 0) {
      logDebugInfo('No audio chunks to upload');
      setError('No audio recorded');
      return;
    }

    setIsUploading(true);
    try {
      logDebugInfo('Preparing audio for upload...');
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      logDebugInfo(`Audio blob size: ${audioBlob.size} bytes`);

      if (!apiKey) {
        throw new Error('Deepgram API key not found');
      }

      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/webm',
        },
        body: audioBlob,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json() as TranscriptionResult;
      logDebugInfo('Transcription received');

      if (result?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        const transcriptText = result.results.channels[0].alternatives[0].transcript;
        setTranscript(transcriptText);
        logDebugInfo('Transcript updated successfully');
      } else {
        throw new Error('Invalid response format from Deepgram');
      }

    } catch (err) {
      const errorMessage = `Transcription error: ${err instanceof Error ? err.message : String(err)}`;
      logDebugInfo(errorMessage);
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Voice to Text Transcription</h2>

      <button
        className={`px-4 py-2 rounded-md mb-4 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50`}
        onClick={isListening ? stopMicrophone : startMicrophone}
        disabled={isUploading}
      >
        {isUploading ? 'Processing...' : isListening ? 'Stop Recording' : 'Start Recording'}
      </button>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-md min-h-[100px] max-h-[400px] overflow-auto mb-4">
        {transcript || 'Your transcript will appear here after recording...'}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">Debug Information</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs whitespace-pre-wrap">
          {debugInfo}
        </pre>
      </details>
    </div>
  );
};

export default Microphone;