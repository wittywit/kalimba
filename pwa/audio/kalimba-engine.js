class KalimbaEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.activeOscillators = new Map();
    this.initialized = false;
    this.sampleBuffers = new Map();
    this.settings = {
      volume: 0.8,
      polyphony: true,
      maxPolyphony: 8,
      tuning: 0, // Fine tuning in cents
      attack: 0.01,
      decay: 1.5,
      sustain: 0.1,
      release: 2.0
    };
  }

  // Initialize Web Audio API
  async initialize() {
    try {
      // Create audio context with proper user gesture handling
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Handle audio context state
      if (this.audioContext.state === 'suspended') {
        // Will be resumed on first user interaction
        document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
        document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
      }

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.settings.volume;
      this.masterGain.connect(this.audioContext.destination);

      // Pre-generate kalimba samples
      await this.generateKalimbaSamples();
      
      this.initialized = true;
      console.log('KalimbaEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize KalimbaEngine:', error);
      this.initialized = false;
    }
  }

  // Resume audio context on user gesture
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('Audio context resumed');
    }
  }

  // Generate kalimba-like samples using FM synthesis
  async generateKalimbaSamples() {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3; // 3 seconds
    const bufferLength = sampleRate * duration;
    
    // Note frequencies for kalimba range
    const noteFreqs = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
    };

    // Generate samples for each note
    for (const [noteName, frequency] of Object.entries(noteFreqs)) {
      const buffer = this.audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      // FM synthesis parameters for kalimba-like sound
      const modulatorFreq = frequency * 2.1; // Slightly inharmonic
      const modulationIndex = 3;
      const harmonicity = 1.8;
      
      for (let i = 0; i < bufferLength; i++) {
        const t = i / sampleRate;
        
        // Envelope (exponential decay)
        const envelope = Math.exp(-t * 2) * 0.3;
        
        // FM synthesis
        const modulator = Math.sin(2 * Math.PI * modulatorFreq * t * harmonicity) * modulationIndex;
        const carrier = Math.sin(2 * Math.PI * frequency * t + modulator) * envelope;
        
        // Add some metallic character with additional harmonics
        const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * envelope * 0.1;
        const harmonic3 = Math.sin(2 * Math.PI * frequency * 3.2 * t) * envelope * 0.05;
        
        // Combine and apply final envelope
        channelData[i] = (carrier + harmonic2 + harmonic3) * envelope;
      }
      
      // Apply tuning offset
      this.sampleBuffers.set(noteName, buffer);
    }
  }

  // Play a note with the given parameters
  playNote(note, velocity = 1.0) {
    if (!this.initialized || !this.audioContext) {
      console.warn('KalimbaEngine not initialized');
      return;
    }

    // Resume audio context if needed
    if (this.audioContext.state === 'suspended') {
      this.resumeAudioContext();
    }

    // Clean up if polyphony is disabled
    if (!this.settings.polyphony && this.activeOscillators.size > 0) {
      this.stopAllNotes();
    }

    // Limit polyphony
    if (this.activeOscillators.size >= this.settings.maxPolyphony) {
      const oldestKey = this.activeOscillators.keys().next().value;
      this.stopNote(oldestKey);
    }

    // Get or create note sample
    const sampleBuffer = this.sampleBuffers.get(note);
    if (!sampleBuffer) {
      console.warn(`No sample found for note: ${note}`);
      return;
    }

    try {
      // Create audio nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      
      // Configure source
      source.buffer = sampleBuffer;
      source.playbackRate.value = 1 + (this.settings.tuning / 1200); // Apply fine tuning
      
      // Configure filter for character
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 3000 + (velocity * 2000);
      filterNode.Q.value = 1;
      
      // Configure gain with velocity
      gainNode.gain.value = velocity * this.settings.volume * 0.5;
      
      // Connect nodes
      source.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Store reference for cleanup
      const nodeId = `${note}-${Date.now()}`;
      this.activeOscillators.set(nodeId, { source, gainNode, filterNode });
      
      // Auto cleanup when finished
      source.onended = () => {
        this.cleanupNode(nodeId);
      };
      
      // Start playback
      source.start(0);
      
      // Auto-release after duration
      setTimeout(() => {
        if (this.activeOscillators.has(nodeId)) {
          this.stopNote(nodeId);
        }
      }, 3000);
      
      return nodeId;
      
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  // Stop a specific note
  stopNote(nodeId) {
    const node = this.activeOscillators.get(nodeId);
    if (node) {
      try {
        // Fade out
        const currentTime = this.audioContext.currentTime;
        node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, currentTime);
        node.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
        
        // Stop after fade
        setTimeout(() => {
          if (node.source) {
            node.source.stop();
          }
          this.cleanupNode(nodeId);
        }, 150);
        
      } catch (error) {
        console.error('Error stopping note:', error);
        this.cleanupNode(nodeId);
      }
    }
  }

  // Stop all currently playing notes
  stopAllNotes() {
    const nodeIds = Array.from(this.activeOscillators.keys());
    nodeIds.forEach(nodeId => this.stopNote(nodeId));
  }

  // Clean up node references
  cleanupNode(nodeId) {
    const node = this.activeOscillators.get(nodeId);
    if (node) {
      try {
        node.source?.disconnect();
        node.gainNode?.disconnect();
        node.filterNode?.disconnect();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      this.activeOscillators.delete(nodeId);
    }
  }

  // Update engine settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply volume change immediately
    if (this.masterGain && newSettings.volume !== undefined) {
      this.masterGain.gain.setValueAtTime(newSettings.volume, this.audioContext.currentTime);
    }
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Dispose of all resources
  dispose() {
    this.stopAllNotes();
    
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.sampleBuffers.clear();
    this.initialized = false;
    
    console.log('KalimbaEngine disposed');
  }

  // Get audio context state for debugging
  getAudioState() {
    return {
      state: this.audioContext?.state,
      initialized: this.initialized,
      activeNotes: this.activeOscillators.size,
      samples: this.sampleBuffers.size
    };
  }
}

// Export for browser global scope
window.KalimbaEngine = KalimbaEngine;