(() => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const autoFillBtn = document.getElementById("autoFillBtn");
  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");
  const transcriptEl = document.getElementById("transcript");

  const inputs = {
    name: document.getElementById("name"),
    age: document.getElementById("age"),
    email: document.getElementById("email"),
    city: document.getElementById("city"),
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = "Speech API not supported. Use Chrome or Edge.";
    startBtn.disabled = true;
    return;
  }

  let recog = new SpeechRecognition();
  recog.lang = "en-IN";
  recog.interimResults = true;
  recog.continuous = true;

  let finalTranscript = "";

  recog.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += " " + text.trim();
      else interim += text;
    }
    transcriptEl.textContent = (finalTranscript + " " + interim).trim();
  };

  recog.onstart = () => {
    statusEl.textContent = "Listening...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };
  recog.onend = () => {
    statusEl.textContent = "Stopped.";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  startBtn.onclick = () => {
    finalTranscript = "";
    recog.start();
  };
  stopBtn.onclick = () => recog.stop();

  autoFillBtn.onclick = () => {
    const text = transcriptEl.textContent.toLowerCase();
    const result = {};

    const nameMatch = text.match(/name is ([a-z\s]+)/);
    if (nameMatch) result.name = nameMatch[1].trim();

    const ageMatch = text.match(/age is (\d+)/);
    if (ageMatch) result.age = ageMatch[1];

    const emailMatch = text.match(/email is ([\w\s@.\-]+)/);
    if (emailMatch) {
      let e = emailMatch[1].trim();
      e = e.replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".");
      result.email = e;
    }

    const cityMatch = text.match(/city is ([a-z\s]+)/) || text.match(/from ([a-z\s]+)/);
    if (cityMatch) result.city = cityMatch[1].trim();

    Object.keys(result).forEach((k) => {
      if (inputs[k]) inputs[k].value = result[k];
    });

    statusEl.textContent =
      Object.keys(result).length > 0 ? "Auto-filled successfully!" : "No match found!";
  };

  clearBtn.onclick = () => {
    Object.values(inputs).forEach((i) => (i.value = ""));
    transcriptEl.textContent = "Transcript will appear here...";
  };

  saveBtn.onclick = () => {
    const data = {
      name: inputs.name.value,
      age: inputs.age.value,
      email: inputs.email.value,
      city: inputs.city.value,
    };
    localStorage.setItem("studentData", JSON.stringify(data));
    statusEl.textContent = "✅ Saved successfully!";
  };
})();