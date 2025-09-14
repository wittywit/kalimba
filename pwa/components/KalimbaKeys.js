const { useState, useEffect, useCallback } = React;

// Scale note mappings
const SCALE_NOTES = {
  'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']
};

const SCALE_TYPES = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'pentatonic': [0, 2, 4, 7, 9],
  'blues': [0, 3, 5, 6, 7, 10],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10]
};

const KalimbaKeys = ({ 
  keyCount = 11, 
  keyHeights = [], 
  scale = 'C', 
  scaleType = 'major',
  onKeyPress 
}) => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [touchTrackingMap, setTouchTrackingMap] = useState(new Map());

  // Generate note sequence for kalimba layout (heart-like pattern)
  const generateNoteSequence = useCallback(() => {
    const scaleNotes = SCALE_NOTES[scale];
    const scalePattern = SCALE_TYPES[scaleType];
    const notes = [];
    
    // Generate enough notes for the kalimba
    for (let octave = 3; octave <= 6; octave++) {
      for (let i = 0; i < scalePattern.length; i++) {
        const noteIndex = scalePattern[i] % scaleNotes.length;
        const noteName = scaleNotes[noteIndex];
        notes.push(`${noteName}${octave}`);
      }
    }
    
    // Kalimba heart pattern: center outward alternating
    const kalimbaNotes = [];
    const centerIndex = Math.floor(keyCount / 2);
    
    // Start from center and alternate left/right
    for (let i = 0; i < keyCount; i++) {
      let noteIndex;
      
      if (i === 0) {
        noteIndex = centerIndex; // Center key
      } else if (i % 2 === 1) {
        noteIndex = centerIndex + Math.ceil(i / 2); // Right side
      } else {
        noteIndex = centerIndex - i / 2; // Left side
      }
      
      // Ensure we don't go out of bounds
      noteIndex = Math.max(0, Math.min(notes.length - 1, noteIndex + 8)); // Offset to get good range
      kalimbaNotes.push(notes[noteIndex]);
    }
    
    return kalimbaNotes;
  }, [keyCount, scale, scaleType]);

  const notes = generateNoteSequence();

  // Handle key press with multi-touch support
  const handleKeyDown = useCallback((keyIndex, event) => {
    // Only preventDefault for non-passive events
    if (event.cancelable) {
      event.preventDefault();
    }
    
    if (event.touches) {
      // Touch events
      Array.from(event.touches).forEach(touch => {
        if (!touchTrackingMap.has(touch.identifier)) {
          setTouchTrackingMap(prev => new Map(prev.set(touch.identifier, keyIndex)));
          setActiveKeys(prev => new Set([...prev, keyIndex]));
          onKeyPress(keyIndex, notes[keyIndex]);
        }
      });
    } else {
      // Mouse events
      if (!activeKeys.has(keyIndex)) {
        setActiveKeys(prev => new Set([...prev, keyIndex]));
        onKeyPress(keyIndex, notes[keyIndex]);
      }
    }
  }, [activeKeys, touchTrackingMap, onKeyPress, notes]);

  const handleKeyUp = useCallback((keyIndex, event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
    
    if (event.touches) {
      // Touch end - remove all touches that ended
      const remainingTouches = Array.from(event.touches).map(t => t.identifier);
      const newTouchMap = new Map();
      const newActiveKeys = new Set();
      
      touchTrackingMap.forEach((mappedKeyIndex, touchId) => {
        if (remainingTouches.includes(touchId)) {
          newTouchMap.set(touchId, mappedKeyIndex);
          newActiveKeys.add(mappedKeyIndex);
        }
      });
      
      setTouchTrackingMap(newTouchMap);
      setActiveKeys(newActiveKeys);
    } else {
      // Mouse events
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyIndex);
        return newSet;
      });
    }
  }, [touchTrackingMap]);

  // Clear all active states on touch cancel
  const handleTouchCancel = useCallback(() => {
    setActiveKeys(new Set());
    setTouchTrackingMap(new Map());
  }, []);

  // Generate key heights if not provided
  const heights = keyHeights.length === keyCount ? keyHeights : 
    Array.from({ length: keyCount }, (_, i) => {
      const center = Math.floor(keyCount / 2);
      const distanceFromCenter = Math.abs(i - center);
      const maxHeight = 280; // Much longer keys
      const minHeight = 180; // Still substantial length
      const heightReduction = Math.pow(distanceFromCenter, 1.3) * 18;
      return Math.max(minHeight, maxHeight - heightReduction);
    });

  // Add event listeners manually for non-passive touch events
  useEffect(() => {
    const keysContainer = document.querySelector('.kalimba-keys');
    if (!keysContainer) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const key = e.target.closest('.kalimba-key');
      if (key) {
        const keyIndex = parseInt(key.dataset.keyIndex);
        handleKeyDown(keyIndex, e);
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      const key = e.target.closest('.kalimba-key');
      if (key) {
        const keyIndex = parseInt(key.dataset.keyIndex);
        handleKeyUp(keyIndex, e);
      }
    };

    keysContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    keysContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    keysContainer.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      keysContainer.removeEventListener('touchstart', handleTouchStart);
      keysContainer.removeEventListener('touchend', handleTouchEnd);
      keysContainer.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleKeyDown, handleKeyUp, handleTouchCancel]);

  return (
    <div 
      className="kalimba-keys"
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
    >
      {notes.map((note, index) => (
        <button
          key={index}
          className={`kalimba-key ${activeKeys.has(index) ? 'playing' : ''}`}
          style={{
            height: `${heights[index]}px`,
            position: 'relative',
            zIndex: activeKeys.has(index) ? 10 : 1
          }}
          onMouseDown={(e) => handleKeyDown(index, e)}
          onMouseUp={(e) => handleKeyUp(index, e)}
          onMouseLeave={(e) => handleKeyUp(index, e)}
          aria-label={`Kalimba key ${index + 1}, note ${note}`}
          data-note={note}
          data-key-index={index}
        >
          {/* Optional note label (can be toggled in settings) */}
          <span 
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none'
            }}
          >
            {note}
          </span>
          
          {/* Enhanced key press effects */}
          {activeKeys.has(index) && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(244, 154, 28, 0.3) 50%, transparent 100%)',
                  animation: 'magicalRipple 0.8s ease-out',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, transparent 30%, rgba(244, 154, 28, 0.2) 50%, transparent 100%)',
                  animation: 'outerRipple 1.0s ease-out',
                  pointerEvents: 'none',
                  zIndex: 4
                }}
              />
            </>
          )}
        </button>
      ))}
      
      <style jsx>{`
        @keyframes magicalRipple {
          0% {
            transform: translateX(-50%) scale(0);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-50%) scale(1.5);
            opacity: 0.6;
          }
          100% {
            transform: translateX(-50%) scale(2.5);
            opacity: 0;
          }
        }
        
        @keyframes outerRipple {
          0% {
            transform: translateX(-50%) scale(0);
            opacity: 0.4;
          }
          100% {
            transform: translateX(-50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Export for browser global scope
window.KalimbaKeys = KalimbaKeys;