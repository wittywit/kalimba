const { useState, useEffect } = React;

const SettingsModal = ({ 
  settings, 
  onSettingsChange, 
  onClose, 
  theme, 
  onThemeChange 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local settings with props
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Apply settings changes with live preview
  const updateSetting = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings); // Live preview
  };

  // Handle modal click-outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Scale options
  const scaleOptions = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const scaleTypeOptions = [
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
    { value: 'pentatonic', label: 'Pentatonic' },
    { value: 'blues', label: 'Blues' },
    { value: 'dorian', label: 'Dorian' },
    { value: 'mixolydian', label: 'Mixolydian' }
  ];

  return (
    <div className="modal-overlay fade-in" onClick={handleBackdropClick}>
      <div className="modal-content scale-in">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          
          {/* Basic Settings */}
          <div className="setting-group">
            <label className="setting-label">Scale Root</label>
            <select 
              className="setting-select"
              value={localSettings.scale}
              onChange={(e) => updateSetting('scale', e.target.value)}
            >
              {scaleOptions.map(scale => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">Scale Type</label>
            <select 
              className="setting-select"
              value={localSettings.scaleType}
              onChange={(e) => updateSetting('scaleType', e.target.value)}
            >
              {scaleTypeOptions.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">Number of Keys</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="range"
                className="setting-range"
                min="7"
                max="17"
                step="1"
                value={localSettings.keyCount}
                onChange={(e) => updateSetting('keyCount', parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                {localSettings.keyCount}
              </span>
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">Volume</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="range"
                className="setting-range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.volume}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                {Math.round(localSettings.volume * 100)}%
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="setting-group">
            <div className="theme-toggle">
              <label className="setting-label">Theme</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    border: '2px solid',
                    borderColor: theme === 'light' ? 'var(--accent-orange)' : '#e0e0e0',
                    borderRadius: '8px',
                    background: theme === 'light' ? 'var(--accent-orange)' : 'transparent',
                    color: theme === 'light' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onThemeChange('light')}
                >
                  ☀️ Light
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    border: '2px solid',
                    borderColor: theme === 'dark' ? 'var(--accent-orange)' : '#e0e0e0',
                    borderRadius: '8px',
                    background: theme === 'dark' ? 'var(--accent-orange)' : 'transparent',
                    color: theme === 'dark' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onThemeChange('dark')}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="setting-group">
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Advanced Settings</span>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{
                  transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="advanced-settings" style={{ 
              borderTop: '1px solid #e0e0e0', 
              paddingTop: '20px',
              marginTop: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input 
                    type="checkbox"
                    checked={localSettings.polyphony}
                    onChange={(e) => updateSetting('polyphony', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Enable Polyphony
                </label>
                <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Play multiple notes simultaneously
                </small>
              </div>

              <div className="setting-group">
                <label className="setting-label">Fine Tuning (cents)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="range"
                    className="setting-range"
                    min="-50"
                    max="50"
                    step="1"
                    value={localSettings.tuning}
                    onChange={(e) => updateSetting('tuning', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: '600' }}>
                    {localSettings.tuning > 0 ? '+' : ''}{localSettings.tuning}
                  </span>
                </div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Adjust pitch in cents (-50 to +50)
                </small>
              </div>

              <div className="setting-group">
                <label className="setting-label">Max Polyphony</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="range"
                    className="setting-range"
                    min="1"
                    max="16"
                    step="1"
                    value={localSettings.maxPolyphony || 8}
                    onChange={(e) => updateSetting('maxPolyphony', parseInt(e.target.value))}
                    disabled={!localSettings.polyphony}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                    {localSettings.maxPolyphony || 8}
                  </span>
                </div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Maximum simultaneous notes
                </small>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--surface-elevated)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                // Reset to defaults
                const defaultSettings = {
                  keyCount: 11,
                  scale: 'C',
                  scaleType: 'major',
                  polyphony: true,
                  tuning: 0,
                  volume: 0.8,
                  maxPolyphony: 8
                };
                setLocalSettings(defaultSettings);
                onSettingsChange(defaultSettings);
              }}
            >
              Reset Defaults
            </button>
            
            <button
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--accent-orange)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={onClose}
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// Export for browser global scope
window.SettingsModal = SettingsModal;