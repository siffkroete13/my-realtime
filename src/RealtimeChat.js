
import React, { useState, useEffect } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

const RealtimeAudioChat = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToAPI = async () => {
      // Initialisiere den Realtime Client
      const realtimeClient = new RealtimeClient({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Dein API-Schlüssel
        dangerouslyAllowAPIKeyInBrowser: true, // Nur, wenn notwendig
      });

      // Verbinde den Realtime Client
      await realtimeClient.connect();
      setClient(realtimeClient);

      // Update Session Parameter
      realtimeClient.updateSession({ instructions: 'You are a great, upbeat friend.' });
      realtimeClient.updateSession({ voice: 'alloy' });
      realtimeClient.updateSession({
        turn_detection: { type: 'none' }, // oder 'server_vad' für Pausenerkennung
        input_audio_transcription: { model: 'whisper-1' },
      });

      // Event Handling für conversation updates
      realtimeClient.on('conversation.updated', (event) => {
        const { item, delta } = event;
        const items = realtimeClient.conversation.getItems();

        if (item.status === 'completed') {
          console.log('Updated conversation:', items);
        } else {
          console.log('Antwort noch unvollständig, warten...');
        }
      });

      // Zugriff auf das Mikrofon erhalten
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = async (event) => {
            const audioChunk = event.data;

            // Konvertiere den Blob in ArrayBuffer
            const arrayBuffer = await audioChunk.arrayBuffer();
            const int16Array = new Int16Array(arrayBuffer);

            // Sende das Audio an die OpenAI API
            realtimeClient.appendInputAudio(int16Array);
          };

          // Starte die Aufnahme
          recorder.start(100); // Sende alle 100ms ein Audio-Chunk
        })
        .catch((error) => console.error('Mikrofonzugriff verweigert:', error));
    };

    connectToAPI();
  }, []);

  const stopRecording = () => {
    mediaRecorder.stop();
    // Fordere das Modell auf, eine Antwort zu generieren
    client.createResponse();
  };

  return (
    <div>
      <h1>Realtime Audio Chat mit GPT</h1>
      <button onClick={stopRecording}>Stop Recording & Get Response</button>
    </div>
  );
};

export default RealtimeAudioChat;


  