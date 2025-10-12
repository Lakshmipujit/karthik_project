let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false; // stop after one phrase
  recognition.interimResults = false;

  const startBtn = document.getElementById('start-btn');
  const output = document.getElementById('output');

  startBtn.addEventListener('click', () => {
    if (!isRecording) {
      recognition.start();
      isRecording = true;
      startBtn.textContent = "Listening...";
      output.textContent = "";
    }
  });

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    output.textContent = "You said: " + transcript;
    isRecording = false;
    startBtn.textContent = "Start Recording";
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
  alert("Speech Recognition not supported in this browser. Use Chrome.");
}