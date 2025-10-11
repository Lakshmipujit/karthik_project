// script.js
// Simple browser-based speech -> form filler using Web Speech API (Chrome/Edge)
// Save this file as script.js in same folder as index.html

(() => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');

  // Inputs
  const inputs = {
    name: document.getElementById('name'),
    age: document.getElementById('age'),
    email: document.getElementById('email'),
    city: document.getElementById('city')
  };

  // Check for Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Speech API not supported in this browser. Use Chrome or Edge.';
    startBtn.disabled = true;
  }

  let recog = null;
  let finalTranscript = '';

  function initRecognition() {
    recog = new SpeechRecognition();
    recog.lang = 'en-IN'; // set language (change as needed)
    recog.interimResults = true;
    recog.continuous = true; // continuous listens until stopped

    recog.onstart = () => {
      statusEl.textContent = 'Listening...';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    };

    recog.onerror = (e) => {
      console.error('Recognition error', e);
      statusEl.textContent = 'Error: ' + (e.error || 'unknown');
    };

    recog.onend = () => {
      statusEl.textContent = 'Stopped';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recog.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + text.trim();
        } else {
          interim += text;
        }
      }
      transcriptEl.textContent = (finalTranscript + ' ' + interim).trim() || 'Transcript will appear here...';
    };
  }

  function startListening() {
    finalTranscript = '';
    transcriptEl.textContent = 'Listening...';
    if (!recog) initRecognition();
    try {
      recog.start();
    } catch (e) {
      // ignore start errors when already started
      console.warn(e);
    }
  }

  function stopListening() {
    if (recog) {
      recog.stop();
    }
  }

  // Very simple parser that looks for patterns like:
  // "Name is John", "Age is 25", "Email is john at example dot com", "City is Mumbai"
  function parseAndFill(text) {
    if (!text || !text.trim()) return {};

    const lowered = text.toLowerCase();

    const result = {};

    // Name: capture "name is <words>"
    const nameMatch = lowered.match(/name is ([a-z\s]+)/i);
    if (nameMatch) {
      // Title-case the name
      result.name = nameMatch[1].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Age: number
    const ageMatch = lowered.match(/age is (\d{1,3})/i) || lowered.match(/(\d{1,3}) years? old/i);
    if (ageMatch) result.age = ageMatch[1];

    // Email: common speech forms "john at example dot com"
    const emailMatch = lowered.match(/email is ([\w\s@.\-]+)/i) || lowered.match(/email ([\w\s@.\-]+)/i);
    if (emailMatch) {
      let e = emailMatch[1].trim();
      // replace spoken " at " and " dot " with symbols
      e = e.replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+dot$/g, '.').replace(/\s+/g, '');
      result.email = e;
    }

    // City:
    const cityMatch = lowered.match(/city is ([a-z\s]+)/i) || lowered.match(/from ([a-z\s]+)/i);
    if (cityMatch) {
      result.city = cityMatch[1].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Also basic "set <field> to <value>"
    const generic = lowered.match(/(name|age|email|city) (is|:|to) ([a-z0-9@\s\.\-]+)/i);
    if (generic) {
      const field = generic[1].trim();
      const value = generic[3].trim();
      result[field] = value;
    }

    // Fill found values into inputs
    Object.keys(result).forEach(k => {
      if (inputs[k]) inputs[k].value = result[k];
    });

    return result;
  }

  // Button events
  startBtn.addEventListener('click', () => {
    startListening();
  });

  stopBtn.addEventListener('click', () => {
    stopListening();
  });

  autoFillBtn.addEventListener('click', () => {
    const text = transcriptEl.textContent || '';
    const parsed = parseAndFill(text);
    statusEl.textContent = Object.keys(parsed).length ? 'Auto-filled fields' : 'No fields detected in transcript';
  });

  clearBtn.addEventListener('click', () => {
    Object.values(inputs).forEach(i => i.value = '');
    transcriptEl.textContent = 'Transcript will appear here...';
    finalTranscript = '';
    statusEl.textContent = 'Cleared';
  });

  // Extra: when user types directly into transcript box (if editable), auto-parse
  transcriptEl.addEventListener && transcriptEl.addEventListener('input', (e) => {
    // noop (kept for potential extension)
  });

  // Init on page load
  initRecognition();
})();