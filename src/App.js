import React, { useState } from 'react';
import RealtimeAudioChat from './RealtimeAudioChat'; // Importiere die Echtzeit-Audio-Komponente
import AudioFileUploader from './AudioFileUploader'; // Importiere die Audio-Upload-Komponente
import AudioRecorder from './AudioRecorder'; // Importiere die Audio-Recorder-Komponente

const App = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div>
      <h1>GPT Audio Test</h1>

      {/* Buttons zum Wechseln zwischen den Komponenten */}
      <div>
        <button onClick={() => setActiveComponent('realtime')}>
          Teste Realtime Audio Chat
        </button>
        <button onClick={() => setActiveComponent('uploader')}>
          Teste Audio Datei Hochladen
        </button>
        <button onClick={() => setActiveComponent('recorder')}>
          Teste Audio Aufnahme
        </button>
      </div>

      {/* Bedingtes Rendern der Komponenten basierend auf dem aktiven Zustand */}
      <div style={{ marginTop: '20px' }}>
        {activeComponent === 'realtime' && <RealtimeAudioChat />}
        {activeComponent === 'uploader' && <AudioFileUploader />}
        {activeComponent === 'recorder' && <AudioRecorder />}
      </div>
    </div>
  );
};

export default App;
