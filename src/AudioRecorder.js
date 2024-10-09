import React, { useState, useEffect } from 'react';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    // Mikrofon-Zugriff anfordern und den MediaRecorder initialisieren
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        // Handelt die verfügbaren Audio-Chunks
        recorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        };
      })
      .catch((error) => console.error('Mikrofonzugriff verweigert:', error));
  }, []);

  // Startet die Aufnahme
  const startRecording = () => {
    setAudioChunks([]);
    mediaRecorder.start();
    setIsRecording(true);
  };

  // Stoppt die Aufnahme
  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);

    // Erstelle die Audio-URL und speichere die Datei
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Optional: Datei herunterladen
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'recorded_audio.wav';
      link.click();
    };
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
