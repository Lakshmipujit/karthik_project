// script.js
// Voice-controlled form filler using Web Speech API
// Compatible with desktop & mobile (Chrome/Edge)

(() => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');

  const inputs = {
    name: document.getElementById('name'),
    age: document.getElementById('age'),
    email: document.getElementById('email'),
    city: document.getElementById('city')
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Speech API not supported in this browser. Use Chrome or Edge.';
    startBtn.disabled = true;
    return;
  }

  let recog = null;
  let finalTranscript = '';
  let isListening = false;

  function initRecognition() {
    recog = new SpeechRecognition();
    recog.lang = 'en-IN';
    recog.interimResults = false;
    recog.continuous = false; // stop automatically after each phrase

    recog.onstart = () => {
      isListening = true;
      statusEl.textContent = 'Listening...';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    };

    recog.onerror = (e) => {
      console.error('Recognition error', e);
      statusEl.textContent = 'Error: ' + (e.error || 'unknown');
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recog.onend = () => {
      isListening = false;
      statusEl.textContent = 'Stopped';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      finalTranscript = text;
      transcriptEl.textContent = text;
    };
  }

  function startListening() {
    if (isListening) return; // prevent multiple starts (especially on mobile)
    finalTranscript = '';
    transcriptEl.textContent = 'Listening...';
    if (!recog) initRecognition();
    try {
      recog.start();
    } catch (e) {
      console.warn('Recognition already started.');
    }
  }

  function stopListening() {
    if (recog && isListening) {
      recog.stop();
    }
  }

  function parseAndFill(text) {
    if (!text || !text.trim()) return {};
    const lowered = text.toLowerCase();
    const result = {};

    const nameMatch = lowered.match(/name is ([a-z\s]+)/i);
    if (nameMatch) {
      result.name = nameMatch[1]
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const ageMatch = lowered.match(/age is (\d{1,3})/i) || lowered.match(/(\d{1,3}) years? old/i);
    if (ageMatch) result.age = ageMatch[1];

    const emailMatch =
      lowered.match(/email is ([\w\s@.\-]+)/i) ||
      lowered.match(/email ([\w\s@.\-]+)/i);
    if (emailMatch) {
      let e = emailMatch[1].trim();
      e = e
        .replace(/\s+at\s+/g, '@')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s+dot$/g, '.')
        .replace(/\s+/g, '');
      result.email = e;
    }

    const cityMatch = lowered.match(/city is ([a-z\s]+)/i) || lowered.match(/from ([a-z\s]+)/i);
    if (cityMatch) {
      result.city = cityMatch[1]
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const generic = lowered.match(/(name|age|email|city) (is|:|to) ([a-z0-9@\s.\-]+)/i);
    if (generic) {
      const field = generic[1].trim();
      const value = generic[3].trim();
      result[field] = value;
    }

    Object.keys(result).forEach(k => {
      if (inputs[k]) inputs[k].value = result[k];
    });

    return result;
  }

  // 🔘 Button Events
  startBtn.addEventListener('click', e => {
    e.preventDefault(); // avoid mobile double-tap trigger
    startListening();
  }, { passive: true });

  stopBtn.addEventListener('click', () => {
    stopListening();
  });

  autoFillBtn.addEventListener('click', () => {
    const text = transcriptEl.textContent || '';
    const parsed = parseAndFill(text);
    statusEl.textContent = Object.keys(parsed).length
      ? 'Auto-filled fields'
      : 'No fields detected in transcript';
  });

  clearBtn.addEventListener('click', () => {
    Object.values(inputs).forEach(i => i.value = '');
    transcriptEl.textContent = 'Transcript will appear here...';
    finalTranscript = '';
    statusEl.textContent = 'Cleared';
  });

  // Initialize once
  initRecognition();
})();