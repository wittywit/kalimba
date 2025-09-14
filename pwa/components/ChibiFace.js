const { useState, useEffect, useRef } = React;

// Import the chibi face variations from the existing generator
const eyeTypes = ['full', 'heart', 'angry', 'caret', 'arch', 'half', 'dead', 'squint', 'squint2', 'line', 'confused', 'empty'];
const mouthTypes = ['open-happy', 'open-happy-big', 'surprised', 'surprised-big', 'confused', 'frown', 'frown-big', 'smile', 'smile-big', 'smirk', 'cat', 'wide', 'wide2', 'open-frown', 'untitled', 'line', 'angry'];

const ChibiFace = ({ expression, size = 120 }) => {
  const svgRef = useRef(null);
  const [currentEyes, setCurrentEyes] = useState(expression.eyes || 'full');
  const [currentMouth, setCurrentMouth] = useState(expression.mouth || 'open-happy');
  const [isBlinking, setIsBlinking] = useState(false);

  // Handle blinking animation
  useEffect(() => {
    if (expression.blinking) {
      setIsBlinking(true);
      const timer = setTimeout(() => {
        setIsBlinking(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [expression.blinking]);

  // Handle expression changes
  useEffect(() => {
    if (expression.eyes && expression.eyes !== currentEyes) {
      setCurrentEyes(expression.eyes);
    }
    if (expression.mouth && expression.mouth !== currentMouth) {
      setCurrentMouth(expression.mouth);
    }
  }, [expression.eyes, expression.mouth, currentEyes, currentMouth]);

  // Create the SVG chibi face with animations
  const renderChibiFace = () => {
    const leftEye = isBlinking ? 'line' : currentEyes;
    const rightEye = isBlinking ? 'line' : currentEyes;
    
    return (
      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 480 480" 
        width={size} 
        height={size}
        className="chibi-face"
        style={{
          filter: expression.reacting ? 'brightness(1.1)' : 'none',
          transition: 'filter 0.2s ease'
        }}
      >
        {/* SVG Definitions */}
        <defs>
          {/* Blush */}
          <symbol id="blush">
            <ellipse cy="275" cx="105" rx="28" ry="18" fill="#ffcdd2" className={expression.reacting ? 'blush-pulse' : ''}/>
            <ellipse ry="18" rx="28" cx="375" cy="275" fill="#ffcdd2" className={expression.reacting ? 'blush-pulse' : ''}/>
          </symbol>
          
          {/* Eyes - Full */}
          <symbol id="eye-full-left">
            <g id="eye-bg">
              <circle cx="101" cy="192" r="47" fill="#212121"/>
              <path d="M62 174c-14-12-12-23-8-37 0 14 11 18 25 20" fill="#212121"/>
            </g>
            <g id="eye-sparkle">
              <circle cy="188" cx="77" r="13" fill="#fff"/>
              <circle cx="90" cy="167" r="6" fill="#fff"/>
            </g>
          </symbol>
          <symbol id="eye-full-right">
            <use href="#eye-bg" transform="translate(480 0) scale(-1 1)"></use>
            <use href="#eye-sparkle" transform="translate(278 0)"></use>
          </symbol>

          {/* Eyes - Surprised */}
          <symbol id="eye-surprised-left">
            <circle cx="101" cy="192" r="54" fill="#212121"/>
            <circle cy="188" cx="77" r="16" fill="#fff"/>
            <circle cx="90" cy="167" r="8" fill="#fff"/>
          </symbol>
          <symbol id="eye-surprised-right">
            <circle cx="379" cy="192" r="54" fill="#212121"/>
            <circle cy="188" cx="403" r="16" fill="#fff"/>
            <circle cx="390" cy="167" r="8" fill="#fff"/>
          </symbol>

          {/* Eyes - Line (for blinking) */}
          <symbol id="eye-line-left">
            <path d="M153 188H69" fill="none" stroke="#212121" strokeWidth="20" strokeLinecap="round"/>
          </symbol>
          <symbol id="eye-line-right">
            <use href="#eye-line-left" transform="translate(480 0) scale(-1 1)"></use>
          </symbol>

          {/* Mouths */}
          <symbol id="mouth-open-happy">
            <path id="mouth-open-happy-bg" d="M289 274c0 38-13 69-49 69s-49-31-49-69z" fill="#212121"/>
            <clipPath id="mouth-open-happy-clip">
              <use href="#mouth-open-happy-bg"></use>
            </clipPath>
            <circle r="29" cx="240" cy="344" clipPath="url(#mouth-open-happy-clip)" fill="#f44336"/>
          </symbol>

          <symbol id="mouth-open-happy-big">
            <path id="mouth-open-happy-big-bg" d="M290 276c0 76-22 138-50 138s-50-62-50-138z" fill="#212121"/>
            <clipPath id="mouth-open-happy-big-clip">
              <use href="#mouth-open-happy-big-bg"></use>
            </clipPath>
            <circle r="29" cx="240" cy="408" clipPath="url(#mouth-open-happy-big-clip)" fill="#f44336"/>
            <rect y="274" x="204" height="26" width="72" fill="#fff"/>
          </symbol>

          <symbol id="mouth-surprised">
            <circle r="18" cx="240" cy="275" fill="#212121"/>
          </symbol>

          <symbol id="mouth-smile">
            <path d="M295 300a60 60 0 01-110 0" fill="none" stroke="#212121" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 560) scale(1 -1)"/>
          </symbol>
        </defs>

        {/* Face elements */}
        <use href={`#eye-${leftEye}-left`} />
        <use href={`#eye-${rightEye}-right`} />
        <use href={`#mouth-${currentMouth}`} />
        <use href="#blush" />

        {/* Animation styles */}
        <style jsx>{`
          .blush-pulse {
            animation: blushPulse 0.3s ease-out;
          }
          
          @keyframes blushPulse {
            0% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.8; transform: scale(1); }
          }
        `}</style>
      </svg>
    );
  };

  return (
    <div className="chibi-face-container" style={{ 
      width: size, 
      height: size,
      transition: 'transform 0.2s ease',
      transform: expression.reacting ? 'scale(1.05)' : 'scale(1)'
    }}>
      {renderChibiFace()}
    </div>
  );
};

// Export for browser global scope
window.ChibiFace = ChibiFace;