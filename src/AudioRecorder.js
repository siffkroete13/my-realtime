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
        recorder.ondataavailable = async (event) => {
            try {
                const audioChunk = event.data;
            
                // Konvertiere den Blob in ArrayBuffer
                const arrayBuffer = await audioChunk.arrayBuffer();
            
                // Prüfe, ob die Byte-Länge des ArrayBuffers korrekt ist (Vielfaches von 2)
                if (arrayBuffer.byteLength % 2 !== 0) {
                  console.warn("Unvollständige Audiodaten empfangen, Bytes nicht durch 2 teilbar.");
                  return; // Unvollständige Daten ignorieren oder hier um weitere Verarbeitung kümmern
                }
            
                // Erstelle einen Int16Array
                const int16Array = new Int16Array(arrayBuffer);
            
                // Sende das Audio an die OpenAI API
                client.appendInputAudio(int16Array);
              } catch (error) {
                console.error("Fehler bei der Verarbeitung des Audios:", error);
              }
        };
      })
      .catch((error) => console.error('Mikrofonzugriff verweigert:', error));
  }, []);

  // Startet die Aufnahme
  const startRecording = () => {
    setAudioChunks([]);  // Leere vorherige Audio-Chunks
    mediaRecorder.start();
    setIsRecording(true);
  };

  // Stoppt die Aufnahme und speichert die Datei
  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);

    // Wenn die Aufnahme gestoppt wird, erstelle die Audio-URL
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
