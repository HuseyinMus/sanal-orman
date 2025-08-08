export class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.initSounds();
  }

  initSounds() {
    // Web Audio API ile basit ses üretimi
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Ses dosyalarını tanımla (URL'ler)
    this.soundLibrary = {
      // Pozitif sesler
      plantTree: this.createTone(440, 0.1, 'sine'), // A notası
      success: this.createChord([523.25, 659.25, 783.99], 0.2), // C majör
      hover: this.createTone(880, 0.05, 'sine'), // Yüksek A
      click: this.createTone(220, 0.1, 'square'), // Düşük A
      
      // Doğa sesleri (synthesized)
      birds: this.createBirdSound(),
      wind: this.createWindSound(),
      
      // UI sesleri
      notification: this.createNotificationSound(),
      error: this.createErrorSound(),
      login: this.createLoginSound()
    };
  }

  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  createChord(frequencies, duration) {
    return () => {
      if (!this.enabled) return;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, duration * 0.8)();
        }, index * 50);
      });
    };
  }

  createBirdSound() {
    return () => {
      if (!this.enabled) return;
      
      const frequencies = [800, 1200, 900, 1100];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, 0.1, 'sine')();
        }, index * 100);
      });
    };
  }

  createWindSound() {
    return () => {
      if (!this.enabled) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      oscillator.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 2);
    };
  }

  createNotificationSound() {
    return () => {
      if (!this.enabled) return;
      
      // Bildirim sesi: Yukarı doğru tonal
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, 0.15)();
        }, index * 100);
      });
    };
  }

  createErrorSound() {
    return () => {
      if (!this.enabled) return;
      
      // Hata sesi: Aşağı doğru tonal
      const frequencies = [400, 350, 300];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, 0.2, 'sawtooth')();
        }, index * 150);
      });
    };
  }

  createLoginSound() {
    return () => {
      if (!this.enabled) return;
      
      // Giriş melodisi
      const melody = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
      melody.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, 0.2)();
        }, index * 150);
      });
    };
  }

  // Ana API metodları
  play(soundName) {
    if (this.soundLibrary[soundName]) {
      try {
        this.soundLibrary[soundName]();
      } catch (error) {
        console.warn('Ses çalınamadı:', error);
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume() {
    return this.volume;
  }

  isEnabled() {
    return this.enabled;
  }

  // Kısa yollar
  plantTree() { this.play('plantTree'); }
  success() { this.play('success'); }
  hover() { this.play('hover'); }
  click() { this.play('click'); }
  birds() { this.play('birds'); }
  wind() { this.play('wind'); }
  notification() { this.play('notification'); }
  error() { this.play('error'); }
  login() { this.play('login'); }
}

// Global ses yöneticisi
export const soundManager = new SoundManager();