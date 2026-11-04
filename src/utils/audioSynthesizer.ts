/**
 * Web Audio API synthesized background beat preview for TikTok/Reels travel videos
 */

let audioCtx: AudioContext | null = null;
let currentSource: OscillatorNode | null = null;
let intervalId: any = null;

export function playTikTokTravelBeat(genre: string = 'tropical'): () => void {
  stopTikTokTravelBeat();

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Rhythmic chord & bass pattern simulating tropical travel beat
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];

    let step = 0;
    const playChordStep = () => {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const currentChord = chords[step % chords.length];

      currentChord.forEach((freq) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();

        osc.type = genre.includes('Phonk') ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(audioCtx!.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      });

      // Bass kick / pluck
      const bassOsc = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(step % 2 === 0 ? 110 : 82.4, now);
      bassGain.gain.setValueAtTime(0.09, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      bassOsc.connect(bassGain);
      bassGain.connect(audioCtx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.35);

      step++;
    };

    playChordStep();
    intervalId = setInterval(playChordStep, 450); // ~133 BPM upbeat travel tempo

  } catch (err) {
    console.warn('Web Audio playback failed or blocked by browser policy:', err);
  }

  return stopTikTokTravelBeat;
}

export function stopTikTokTravelBeat() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {}
    audioCtx = null;
  }
}
