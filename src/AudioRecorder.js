import React, { useState, useEffect, useRef } from 'react';

const AudioRecorder = () => {
  const mediaRecorderRef = useRef(null);    // Verwende useRef für mediaRecorder
  const audioChunksRef = useRef([]);        // Verwende useRef für audioChunks
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    // Mikrofon-Zugriff anfordern und den MediaRecorder initialisieren
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        // Handelt die verfügbaren Audio-Chunks
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        // Wenn die Aufnahme gestoppt wird, erstelle die Audio-URL
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];  // Leere die Audio-Chunks
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          // Optional: Datei herunterladen
          const link = document.createElement('a');
          link.href = audioUrl;
          link.download = 'recorded_audio.wav';
          link.click();
        };

        mediaRecorderRef.current = mediaRecorder;
      })
      .catch((error) => console.error('Mikrofonzugriff verweigert:', error));
  }, []);

  // Startet die Aufnahme
  const startRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];  // Leere vorherige Audio-Chunks
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      console.error('MediaRecorder ist nicht initialisiert');
    }
  };

  // Stoppt die Aufnahme
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.error('MediaRecorder ist nicht initialisiert');
    }
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
      <button onClick={startRecording} disabled={isRecording}>Aufnahme starten</button>
      <button onClick={stopRecording} disabled={!isRecording}>Aufnahme stoppen</button>

      {audioUrl && (
        <div>
          <h2>Aufnahme abgeschlossen:</h2>
          <audio src={audioUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
