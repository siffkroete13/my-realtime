import React, { useEffect } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

const RealtimeChat = () => {
  useEffect(() => {
    const connectToAPI = async () => {
      // Initialisiere den Realtime Client
      const client = new RealtimeClient({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Nutze Umgebungsvariablen
        dangerouslyAllowAPIKeyInBrowser: true,  // Unsicher, aber notwendig für Browsernutzung
      });

      // Update Session Parameter
      client.updateSession({ instructions: 'You are a great, upbeat friend.' });
      client.updateSession({ voice: 'alloy' });
      client.updateSession({
        turn_detection: { type: 'none' }, // or 'server_vad'
        input_audio_transcription: { model: 'whisper-1' },
      });

      // Event Handling für conversation updates
      client.on('conversation.updated', (event) => {
        const { item, delta } = event;
        const items = client.conversation.getItems();

        if (item.status === 'completed') {
            const items = client.conversation.getItems();
            console.log('Updated conversation:', items);
        } else {
            console.log('Antwort noch unvollständig, warten...');
        }
      });

      // Verbinde mit der Realtime API
      await client.connect();

      // Sende eine Textnachricht
      client.sendUserMessageContent([{ type: 'input_text', text: 'How are you?' }]);
    };

    connectToAPI();
  }, []);

  return (
    <div>
      <h1>Realtime Chat mit GPT</h1>
    </div>
  );
};

export default RealtimeChat;
