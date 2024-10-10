import React, { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

const AudioFileUploader = () => {
  const [file, setFile] = useState(null);
  const clientRef = useRef(null);  // Verwende useRef für den RealtimeClient
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [clientInitialized, setClientInitialized] = useState(false);  // Um zu verhindern, dass der Client mehrfach initialisiert wird

  // Initialisiere den RealtimeClient und registriere den Event-Handler
  useEffect(() => {
    const initClient = async () => {
      try {
        const realtimeClient = new RealtimeClient({
          apiKey: process.env.REACT_APP_OPENAI_API_KEY,
          dangerouslyAllowAPIKeyInBrowser: true,
        });

        clientRef.current = realtimeClient;

        // Verbinde mit der API
        await  clientRef.current.connect();
        
        // Setze die Sitzungseinstellungen (Beachte die richtige Reihenfolge)
        await  clientRef.current.updateSession({ 
            instructions: 'Du bist ein großartiger Gesprächspartner, antworte mir auch auf audio dateien, auf deren Inhalt.' 
        });
        await clientRef.current.updateSession({ voice: 'alloy' });
        await  clientRef.current.updateSession({
          turn_detection: { type: 'none' }, // none oder 'server_vad'
          input_audio_transcription: { model: 'whisper-1' },
        });
        /*
        await  clientRef.current.sendUserMessageContent([
            { type: 'input_audio', audio: new Int16Array(0) },
        ]);
        */

        // Event-Handler für GPT-Antworten
        clientRef.current.on('conversation.updated', (event) => {
          const { item } = event;

          if (item.status === 'completed') {
            const items =  clientRef.current.conversation.getItems();
            const lastItem = items[items.length - 1];

            if (lastItem.role === 'assistant') {
              if (lastItem.content[0]?.type === 'text') {
                setResponse(lastItem.content[0].text);
              } else if (lastItem.content[0]?.type === 'audio') {
                const transcript = lastItem.content[0].transcript;
                setResponse(transcript);

                // Audio-Daten extrahieren und im UI abspielen
                const audioData = lastItem.formatted.audio;
                const audioArrayBuffer = new Uint8Array(Object.values(audioData)).buffer;
                const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
              }
            } else {
                setResponse(lastItem.content[0].text);
            }
          }
        });

        clientRef.current.createResponse();

        setClientInitialized(true);  // Markiere den Client als initialisiert
      } catch (error) {
        console.error('Fehler beim Initialisieren des Clients:', error);
      }
    };

    if (!clientInitialized) {
      initClient();  // Nur einmal den Client initialisieren
    }
  }, [clientInitialized]);

  // Verarbeite die Datei
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Sende die Audiodatei an die API
  const sendAudioFile = async () => {
    if (file && clientRef.current) {
      try {
        // Lese die Datei als ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Erstelle einen AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Dekodiere die Audiodaten
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Extrahiere die PCM-Daten vom ersten Kanal
        const pcmData = audioBuffer.getChannelData(0); // Float32Array mit Werten zwischen -1 und 1

        // Konvertiere Float32Array in Int16Array
        const int16Array = floatTo16BitPCM(pcmData);

        // Sende das Audio an die API
        // clientRef.current.appendInputAudio(int16Array);
        
        await clientRef.current.sendUserMessageContent([
            { type: 'input_audio', audio: int16Array },
        ]);
        

        // Fordere die Antwort an
        // clientRef.current.createResponse();
      } catch (error) {
        console.error('Fehler beim Senden der Audiodatei:', error);
      }
    }
  };

  // Hilfsfunktion zum Konvertieren von Float32Array in Int16Array
  function floatTo16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  // Funktion zum Senden der Testnachricht
  const sendTestMessage = () => {
    if (clientRef.current) {
      clientRef.current.sendUserMessageContent([{ type: 'text', text: 'Hast du meine Audiodatei erhalten?' }]);
    }
  };

  return (
    <div>
      <h1>Einmalige Audiodatei senden</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={sendAudioFile} disabled={!file}>Senden</button>
      <button onClick={sendTestMessage}>Testnachricht senden</button>

      {response && (
        <div>
          <h2>GPT Antwort:</h2>
          <p>{response}</p>
        </div>
      )}

      {audioUrl && (
        <div>
          <h2>GPT Audio Antwort:</h2>
          <audio src={audioUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioFileUploader;
