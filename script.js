// script.js — Final unified version for Student + Faculty dashboards
(() => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');

  // Form fields (some may not exist in every dashboard)
  const inputs = {
    name: document.getElementById('name'),
    age: document.getElementById('age'),
    roll: document.getElementById('roll'),
    email: document.getElementById('email'),
    city: document.getElementById('city'),
    department: document.getElementById('department'),
  };

  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (statusEl) statusEl.textContent = 'Speech API not supported in this browser. Use Chrome or Edge.';
    if (startBtn) startBtn.disabled = true;
    return;
  }

  let recog = null;
  let isListening = false;

  function initRecognition() {
    recog = new SpeechRecognition();
    recog.lang = 'en-IN';
    recog.interimResults = false;
    recog.continuous = false;

    recog.onstart = () => {
      isListening = true;
      if (statusEl) statusEl.textContent = '🎙️ Listening...';
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
    };

    recog.onerror = (e) => {
      console.error('Speech recognition error:', e);
      if (statusEl) statusEl.textContent = 'Error: ' + e.error;
      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    };

    recog.onend = () => {
      isListening = false;
      if (statusEl) statusEl.textContent = 'Stopped';
      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    };

    recog.onresult = (event) => {
      let text = event.results[0][0].transcript.trim();
      console.log('🎤 Transcript:', text);
      if (transcriptEl) transcriptEl.textContent = text;
    };
  }

  function startListening() {
    if (!recog) initRecognition();
    try {
      recog.start();
    } catch (e) {
      console.warn('Error starting recognition:', e);
    }
  }

  function stopListening() {
    if (recog && isListening) recog.stop();
  }

  // Helper functions
  const titleCase = (s) => s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const normalize = (t) => t.replace(/[^\w\s@.\-]/g, ' ').replace(/\s+/g, ' ').trim();

  // Parse transcript text and autofill
  function parseAndFill(text) {
    if (!text) return;
    const lowered = normalize(text.toLowerCase());
    const result = {};

    // Name
    const nameMatch = lowered.match(/\bname (?:is|:)?\s*([a-z\s]+)/i);
    if (nameMatch) result.name = titleCase(nameMatch[1].trim());

    // Age
    const ageMatch = lowered.match(/\bage (?:is|:)?\s*(\d{1,3})/i) || lowered.match(/(\d{1,3}) years? old/i);
    if (ageMatch) result.age = ageMatch[1];

    // Roll Number
    const rollMatch = lowered.match(/\broll(?: number)? (?:is|:)?\s*(\d+)/i);
    if (rollMatch) result.roll = rollMatch[1];

    // Department
    const deptMatch =
      lowered.match(/\bdepartment (?:is|:)?\s*([a-z\s]+)/i) ||
      lowered.match(/\bdept (?:is|:)?\s*([a-z\s]+)/i) ||
      lowered.match(/\bfrom (?:the )?([a-z\s]+) department\b/i);
    if (deptMatch) result.department = titleCase(deptMatch[1].trim());

    // Email
    const emailMatch =
      lowered.match(/\bemail (?:is|:)?\s*([\w\s@.\-]+)/i) ||
      lowered.match(/\b([\w\s]+ at [\w\s]+ dot [\w\s]+)/i);
    if (emailMatch) {
      let e = emailMatch[1].trim();
      e = e.replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, '');
      result.email = e;
    }

    // City
    const cityMatch =
      lowered.match(/\bcity (?:is|:)?\s*([a-z\s]+)/i) ||
      lowered.match(/\bi live in\s*([a-z\s]+)/i) ||
      lowered.match(/\bi am from\s*([a-z\s]+)/i) ||
      lowered.match(/\bfrom\s*([a-z\s]+)/i);
    if (cityMatch) result.city = titleCase(cityMatch[1].trim());

    console.log('✅ Parsed result:', result);

    // Autofill fields
    Object.keys(result).forEach((key) => {
      if (inputs[key]) inputs[key].value = result[key];
    });

    if (Object.keys(result).length > 0) {
      statusEl.textContent = '✅ Auto-filled successfully';
    } else {
      statusEl.textContent = '⚠️ No matching fields found';
    }
  }

  // Button actions
  startBtn?.addEventListener('click', startListening);
  stopBtn?.addEventListener('click', stopListening);
  autoFillBtn?.addEventListener('click', () => parseAndFill(transcriptEl?.textContent));
  clearBtn?.addEventListener('click', () => {
    Object.values(inputs).forEach((i) => (i ? (i.value = '') : null));
    if (transcriptEl) transcriptEl.textContent = 'Transcript will appear here...';
    if (statusEl) statusEl.textContent = 'Cleared';
  });

  initRecognition();
  console.log('✅ script.js loaded successfully');
})();