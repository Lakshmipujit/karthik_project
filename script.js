(() => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const autoFillBtn = document.getElementById("autoFillBtn");
  const clearBtn = document.getElementById("clearBtn");
  const statusEl = document.getElementById("status");
  const transcriptEl = document.getElementById("transcript");

  const inputs = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    city: document.getElementById("city"),
    department: document.getElementById("department"),
    roll: document.getElementById("roll"),
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = "Speech recognition not supported in this browser. Use Chrome.";
    startBtn.disabled = true;
    return;
  }

  let recog;
  let finalTranscript = "";
  let isListening = false;

  function initRecognition() {
    recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onstart = () => {
      isListening = true;
      statusEl.textContent = "🎙️ Listening...";
      startBtn.disabled = true;
      stopBtn.disabled = false;
    };

    recog.onerror = (e) => {
      console.error("Recognition error:", e);
      statusEl.textContent = "Error: " + (e.error || "unknown");
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recog.onend = () => {
      isListening = false;
      statusEl.textContent = "Stopped";
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recog.onresult = (event) => {
      let text = event.results[0][0].transcript.trim();
      text = text.replace(/\b(\w+)( \1\b)+/gi, "$1"); // Fix duplicate words
      finalTranscript = text;
      transcriptEl.textContent = text;
    };
  }

  function startListening() {
    if (isListening) return;
    finalTranscript = "";
    transcriptEl.textContent = "Listening...";
    if (!recog) initRecognition();
    try {
      recog.start();
    } catch (e) {
      console.warn(e);
    }
  }

  function stopListening() {
    if (recog && isListening) recog.stop();
  }

  function parseAndFill(text) {
    if (!text || !text.trim()) return {};
    const lowered = text.toLowerCase();
    const result = {};

    const nameMatch = lowered.match(/name is ([a-z\s]+)/i);
    if (nameMatch) result.name = nameMatch[1].trim();

    const emailMatch = lowered.match(/email is ([\w\s@.\-]+)/i);
    if (emailMatch)
      result.email = emailMatch[1]
        .trim()
        .replace(/\s+at\s+/g, "@")
        .replace(/\s+dot\s+/g, ".")
        .replace(/\s+/g, "");

    const cityMatch = lowered.match(/city is ([a-z\s]+)/i);
    if (cityMatch) result.city = cityMatch[1].trim();

    const deptMatch = lowered.match(/department is ([a-z\s]+)/i);
    if (deptMatch) result.department = deptMatch[1].trim();

    const rollMatch = lowered.match(/roll number is (\d+)/i);
    if (rollMatch) result.roll = rollMatch[1];

    Object.keys(result).forEach((k) => {
      if (inputs[k]) inputs[k].value = result[k];
    });

    return result;
  }

  startBtn.addEventListener("click", startListening);
  stopBtn.addEventListener("click", stopListening);
  autoFillBtn.addEventListener("click", () => {
    const text = transcriptEl.textContent || "";
    const parsed = parseAndFill(text);
    statusEl.textContent = Object.keys(parsed).length
      ? "✅ Auto-filled fields"
      : "⚠️ No fields detected";
  });
  clearBtn.addEventListener("click", () => {
    Object.values(inputs).forEach((i) => (i.value = ""));
    transcriptEl.textContent = "Transcript will appear here...";
    finalTranscript = "";
    statusEl.textContent = "Cleared";
  });

  initRecognition();
})();