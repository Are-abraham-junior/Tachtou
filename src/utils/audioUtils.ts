/**
 * Web Audio API & Speech Synthesis for TACHTOU RPG Gaming FX
 */

// 1. Sword Slash & Metal Impact Sound FX
export function playSwordSlashSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // --- Whoosh / Swish Sound (Noise Generator) ---
    const bufferSize = ctx.sampleRate * 0.25; // 250ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for swish frequency sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    filter.Q.value = 3.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);

    // --- Metallic Blade Clang / Zing ---
    const metalOsc = ctx.createOscillator();
    const metalGain = ctx.createGain();

    metalOsc.type = 'triangle';
    metalOsc.frequency.setValueAtTime(2800, now + 0.08);
    metalOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    metalGain.gain.setValueAtTime(0, now);
    metalGain.gain.setValueAtTime(0.3, now + 0.08);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    metalOsc.connect(metalGain);
    metalGain.connect(ctx.destination);

    metalOsc.start(now + 0.08);
    metalOsc.stop(now + 0.35);
  } catch (err) {
    console.warn('Audio FX error:', err);
  }
}

// 2. Speech Synthesis: "Félicitations [Titre] [Nom] !" (Warm & Energetic Hero Voice)
export function speakCongratulations(
  heroName: string,
  title?: string,
  audioEnabled: boolean = true
) {
  if (!audioEnabled || !('speechSynthesis' in window)) return;

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const cleanTitle = title?.trim() || '';
    const cleanName = heroName?.trim() || 'Junior';
    const salutation = cleanTitle ? `${cleanTitle} ${cleanName}` : cleanName;
    const text = `Félicitations, ${salutation} ! Bravo, la quête est accomplie !`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.pitch = 1.08; // Warm, upbeat, energetic pitch
    utterance.rate = 1.10;  // Enthusiastic heroic pace
    utterance.volume = 1.0;

    const speakWithBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const frVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('fr'));

      if (frVoices.length > 0) {
        // Prioritize explicit male or natural high-quality French voices
        const energeticVoice = frVoices.find((v) => {
          const nameLower = v.name.toLowerCase();
          return (
            nameLower.includes('thomas') ||
            nameLower.includes('paul') ||
            nameLower.includes('nicolas') ||
            nameLower.includes('male') ||
            nameLower.includes('homme') ||
            nameLower.includes('mathieu') ||
            nameLower.includes('remi') ||
            nameLower.includes('rémi') ||
            nameLower.includes('natural') ||
            nameLower.includes('enhanced') ||
            nameLower.includes('premium') ||
            nameLower.includes('google')
          );
        });

        utterance.voice = energeticVoice || frVoices[0];
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      speakWithBestVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithBestVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
      // Fallback invocation in case event doesn't fire
      setTimeout(speakWithBestVoice, 100);
    }
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

// 3. Retro 8-bit Fanfare for Level Up
export function playLevelUpSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  } catch (err) {
    console.warn('Level up sound error:', err);
  }
}
