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

    // name (letters + spaces)
    const nameMatch = lowered.match(/(?:name)\s*(?:is|:)?\s*([a-z\s]+)/i);
    if (nameMatch) result.name = capitalize(nameMatch[1]);

    // email (allow spoken forms like 'john at example dot com')
    const emailMatch = lowered.match(/(?:email)\s*(?:is|:)?\s*([\w\s@.\-]+)/i);
    if (emailMatch) result.email = emailMatch[1].replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, '');

    // city: allow letters, numbers, hyphens, ampersand, dots; stop at punctuation
    const cityMatch = lowered.match(/(?:city)\s*(?:is|:)?\s*([a-z0-9\s\-\&\.]+)/i);
    if (cityMatch) result.city = capitalize(cityMatch[1].trim().replace(/[\.,;:\!]+$/,''));

    // department / dept: allow similar chars
    const deptMatch = lowered.match(/(?:department|dept)\s*(?:is|:)?\s*([a-z0-9\s\-\&\.]+)/i);
    if (deptMatch) result.department = capitalize(deptMatch[1].trim().replace(/[\.,;:\!]+$/,''));

    // roll number (digits)
    const rollMatch = lowered.match(/roll(?: number)?\s*(?:is|:)?\s*(\d+)/i);
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

  // ✅ Save button sends data to Flask backend (robust JSON/error handling)
  saveBtn.addEventListener('click', async () => {
    const data = {};
    Object.keys(inputs).forEach(k => data[k] = inputs[k]?.value?.trim() || '');

    try {
      const res = await fetch('/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      if (!res.ok) {
        // Try to read JSON message or fallback to text (e.g., HTML 404 page)
        if (contentType.includes('application/json')) {
          const err = await res.json();
          alert(err.message || 'Save failed (server error)');
        } else {
          const text = await res.text();
          alert('Save failed: server returned non-JSON response:\n' + (text.substring(0, 500) || '')); 
        }
        return;
      }

      if (contentType.includes('application/json')) {
        const result = await res.json();
        alert(result.message || 'Saved');
      } else {
        // Backend returned HTML or other content (common when running on static Pages)
        const text = await res.text();
        alert('Save succeeded but server returned non-JSON response:\n' + (text.substring(0, 500) || ''));
      }
    } catch (e) {
      alert('Save failed: ' + e.message + '\n(If you are running the site on GitHub Pages this action requires a running backend at /save)');
    }
  });
})();
