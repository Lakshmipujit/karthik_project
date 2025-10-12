let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  const startBtn = document.getElementById('start-btn');
  const output = document.getElementById('output');

  // prevent double trigger on mobile
  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecording) return;
    recognition.start();
    isRecording = true;
    startBtn.textContent = "Listening...";
    output.textContent = "";
  }, { passive: true });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    output.textContent = "You said: " + transcript;
  };

  recognition.onend = () => {
    isRecording = false;
    startBtn.textContent = "Start Recording";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isRecording = false;
    startBtn.textContent = "Start Recording";
  };
} else {
  alert("Speech Recognition not supported on this browser. Use Chrome or Edge.");
}