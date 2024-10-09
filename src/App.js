import logo from './logo.svg';
import './App.css';
import RealtimeChat from './RealtimeChat';  // Die Realtime-Komponente importieren
import AudioFileUploader from './AutioFileUploader';

const App = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div>
      <h1>GPT Audio Test</h1>

      <div>
        <button onClick={() => setActiveComponent('realtime')}>
          Teste Realtime Audio Chat
        </button>
        <button onClick={() => setActiveComponent('uploader')}>
          Teste Audio Datei Hochladen
        </button>
      </div>

      {/* Bedingtes Rendern der Komponenten basierend auf dem aktiven Zustand */}
      <div style={{ marginTop: '20px' }}>
        {activeComponent === 'realtime' && <RealtimeChat />}
        {activeComponent === 'uploader' && <AudioFileUploader />}
      </div>
    </div>
  );
};

export default App;
