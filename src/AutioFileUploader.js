import React, { useState, useEffect } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

const AudioFileUploader = () => {
  const [file, setFile] = useState(null);
  const [client, setClient] = useState(null);
  const [response, setResponse] = useState('');

  // Initialisiere den RealtimeClient, wenn die Komponente geladen wird
  useEffect(() => {
    const initClient = async () => {
      const realtimeClient = new RealtimeClient({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowAPIKeyInBrowser: true,
      });

      await realtimeClient.connect();
      setClient(realtimeClient);

      // Update Session Parameter
      realtimeClient.updateSession({ instructions: 'You are a great, upbeat friend.' });
      realtimeClient.updateSession({ voice: 'alloy' });
      realtimeClient.updateSession({
        turn_detection: { type: 'none' }, // oder 'server_vad' für Pausenerkennung
        input_audio_transcription: { model: 'whisper-1' },
      });
    };

    initClient(); // Initialisiere den Client beim Laden der Komponente
  }, []);

  // Verarbeite die Datei
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Sende die Audiodatei an die API
  const sendAudioFile = async () => {
    if (file && client) {
      const arrayBuffer = await file.arrayBuffer();
      const int16Array = new Int16Array(arrayBuffer);

      // Sende das Audio an die API
      client.appendInputAudio(int16Array);

      // Fordere die Antwort an
      client.createResponse();

      // Event-Handler für die GPT-Antwort
      client.on('conversation.updated', (event) => {
        const { item } = event;

        if (item.status === 'completed') {
          const items = client.conversation.getItems();
          const gptResponse = items[items.length - 1].text;
          setResponse(gptResponse);
        }
      });
    }
  };

  return (
    <div>
      <h1>Einmalige Audio Datei senden</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={sendAudioFile} disabled={!file}>Senden</button>

      {response && (
        <div>
          <h2>GPT Antwort:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default AudioFileUploader;
