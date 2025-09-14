const { useState, useEffect } = React;

const RecordButton = ({ isRecording, onToggle }) => {
  const [recordingTime, setRecordingTime] = useState(0);

  // Timer for recording duration
  useEffect(() => {
    let interval = null;
    
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <button 
      className={`record-button ${isRecording ? 'recording' : ''}`}
      onClick={onToggle}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minWidth: isRecording ? '120px' : '100px',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Microphone Icon */}
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        style={{
          transition: 'transform 0.2s ease',
          transform: isRecording ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>
      
      {/* Button Text */}
      <span style={{ marginLeft: '6px', fontWeight: '600' }}>
        {isRecording ? 'Stop' : 'Record'}
      </span>
      
      {/* Recording Timer */}
      {isRecording && (
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '2px 8px',
            borderRadius: '10px',
            minWidth: '40px',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {formatTime(recordingTime)}
        </div>
      )}
      
      {/* Pulse Effect for Recording */}
      {isRecording && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'white',
              transform: 'translate(-50%, -50%)',
              animation: 'recordingDot 1s ease-in-out infinite'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              animation: 'recordingRipple 2s ease-out infinite'
            }}
          />
        </>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes recordingDot {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes recordingRipple {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

// Export for browser global scope
window.RecordButton = RecordButton;