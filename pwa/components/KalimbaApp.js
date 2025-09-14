const { useState, useEffect, useRef } = React;

const KalimbaApp = () => {
  // State management
  const [theme, setTheme] = useState('light');
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chibiExpression, setChibiExpression] = useState({ 
    eyes: 'full', 
    mouth: 'open-happy',
    blinking: false,
    reacting: false
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    keyCount: 11,
    scale: 'C',
    scaleType: 'major',
    polyphony: true,
    tuning: 0,
    volume: 0.8
  });

  // Refs
  const kalimbaEngineRef = useRef(null);
  const recordingDataRef = useRef([]);

  // Initialize audio engine
  useEffect(() => {
    kalimbaEngineRef.current = new window.KalimbaEngine();
    kalimbaEngineRef.current.initialize();
    
    return () => {
      if (kalimbaEngineRef.current) {
        kalimbaEngineRef.current.dispose();
      }
    };
  }, []);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PWA installation
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Chibi face animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setChibiExpression(prev => ({
        ...prev,
        blinking: true
      }));
      
      setTimeout(() => {
        setChibiExpression(prev => ({
          ...prev,
          blinking: false
        }));
      }, 150);
    }, 3000 + Math.random() * 3000); // Blink every 3-6 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Handle key press
  const handleKeyPress = (keyIndex, note) => {
    if (kalimbaEngineRef.current) {
      kalimbaEngineRef.current.playNote(note, settings.volume);
      
      // Record if recording
      if (isRecording) {
        recordingDataRef.current.push({
          note,
          timestamp: Date.now(),
          velocity: settings.volume
        });
      }
      
      // Chibi face reaction
      setChibiExpression(prev => ({
        ...prev,
        reacting: true,
        eyes: Math.random() < 0.3 ? 'surprised' : 'full',
        mouth: Math.random() < 0.5 ? 'open-happy-big' : 'open-happy'
      }));
      
      setTimeout(() => {
        setChibiExpression(prev => ({
          ...prev,
          reacting: false,
          eyes: 'full',
          mouth: 'open-happy'
        }));
      }, 200);
    }
  };

  // Handle settings change
  const handleSettingsChange = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    if (kalimbaEngineRef.current) {
      kalimbaEngineRef.current.updateSettings(newSettings);
    }
  };

  // Handle recording
  const handleRecordToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      const recordingData = recordingDataRef.current;
      recordingDataRef.current = [];
      
      // Process recording data here
      console.log('Recording stopped, data:', recordingData);
    } else {
      // Start recording
      setIsRecording(true);
      recordingDataRef.current = [];
    }
  };

  // Install PWA
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Generate key heights based on heart-like pattern
  const generateKeyHeights = (keyCount) => {
    const baseHeight = 120;
    const maxHeight = 200;
    const center = Math.floor(keyCount / 2);
    
    return Array.from({ length: keyCount }, (_, i) => {
      const distanceFromCenter = Math.abs(i - center);
      const heightReduction = Math.pow(distanceFromCenter, 1.2) * 15;
      return Math.max(baseHeight, maxHeight - heightReduction);
    });
  };

  return (
    <div className="kalimba-app">
      {/* Top Navigation */}
      <nav className="top-nav">
        <button className="nav-button" onClick={() => window.history.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          <span style={{ marginLeft: '4px', fontSize: '16px' }}>Back</span>
        </button>
        
        <h1 className="nav-title">KalimbaX</h1>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="nav-button" 
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'var(--surface)',
              borderRadius: '8px',
              boxShadow: '0 4px 16px var(--shadow-medium)',
              padding: '8px 0',
              minWidth: '160px',
              zIndex: 200
            }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // Handle export
                  setShowMenu(false);
                }}
              >
                Export Recording
              </button>
              {isInstallable && (
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    handleInstallPWA();
                    setShowMenu(false);
                  }}
                >
                  Install App
                </button>
              )}
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                onClick={() => setShowMenu(false)}
              >
                Help
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Play Area */}
      <main className="play-area">
        {/* Chibi Face */}
        <div className="chibi-container">
          {React.createElement(window.ChibiFace, {
            expression: chibiExpression,
            size: 120
          })}
        </div>

        {/* Kalimba */}
        <div className="kalimba-container">
          <div className="kalimba-bridge"></div>
          {React.createElement(window.KalimbaKeys, {
            keyCount: settings.keyCount,
            keyHeights: generateKeyHeights(settings.keyCount),
            scale: settings.scale,
            scaleType: settings.scaleType,
            onKeyPress: handleKeyPress
          })}
        </div>
      </main>

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <button 
          className="control-button"
          onClick={() => setShowSettings(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
        </button>

        {React.createElement(window.RecordButton, {
          isRecording: isRecording,
          onToggle: handleRecordToggle
        })}

        <button className="control-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && React.createElement(window.SettingsModal, {
        settings: settings,
        onSettingsChange: handleSettingsChange,
        onClose: () => setShowSettings(false),
        theme: theme,
        onThemeChange: setTheme
      })}
    </div>
  );
};

// Export for browser global scope
window.KalimbaApp = KalimbaApp;