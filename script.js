(() => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');

  const inputs = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    city: document.getElementById('city'),
    department: document.getElementById('department'),
    roll: document.getElementById('roll')
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Speech API not supported in this browser.';
    startBtn.disabled = true;
    return;
  }

  let recog = new SpeechRecognition();
  recog.lang = 'en-IN';
  recog.interimResults = false;
  recog.continuous = false;

  recog.onstart = () => {
    statusEl.textContent = '🎤 Listening...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recog.onerror = (e) => {
    statusEl.textContent = 'Error: ' + e.error;
  };

  recog.onend = () => {
    statusEl.textContent = 'Stopped';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recog.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    transcriptEl.textContent = text;
  };

  function parseAndFill(text) {
    if (!text) return {};
    const lowered = text.toLowerCase();
    const result = {};

    const nameMatch = lowered.match(/name is ([a-z\s]+)/i);
    if (nameMatch) result.name = capitalize(nameMatch[1]);
    const emailMatch = lowered.match(/email is ([\w\s@.\-]+)/i);
    if (emailMatch) result.email = emailMatch[1].replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, '');
    const cityMatch = lowered.match(/city is ([a-z\s]+)/i);
    if (cityMatch) result.city = capitalize(cityMatch[1]);
    const deptMatch = lowered.match(/department is ([a-z\s]+)/i);
    if (deptMatch) result.department = capitalize(deptMatch[1]);
    const rollMatch = lowered.match(/roll number is (\d+)/i);
    if (rollMatch) result.roll = rollMatch[1];

    Object.keys(result).forEach(k => { if (inputs[k]) inputs[k].value = result[k]; });
    return result;
  }

  function capitalize(str) {
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  startBtn.addEventListener('click', () => recog.start());
  stopBtn.addEventListener('click', () => recog.stop());
  autoFillBtn.addEventListener('click', () => parseAndFill(transcriptEl.textContent));
  clearBtn.addEventListener('click', () => {
    Object.values(inputs).forEach(i => i.value = '');
    transcriptEl.textContent = '';
    statusEl.textContent = 'Cleared';
  });

  // ✅ Save button sends data to Flask backend
  saveBtn.addEventListener('click', async () => {
    const data = {};
    Object.keys(inputs).forEach(k => data[k] = inputs[k]?.value?.trim() || '');

    const res = await fetch('/save', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);
  });
})();
