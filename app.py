import speech_recognition as sr
import pyautogui
import pyttsx3
import time

# Initialize speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 160)  # Adjust speaking speed

def speak(text):
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen to user speech and convert to text"""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source, phrase_time_limit=8)
    try:
        text = r.recognize_google(audio)
        print(f"You said: {text}")
        return text
    except sr.UnknownValueError:
        speak("Sorry, I did not understand that.")
        return ""
    except sr.RequestError:
        speak("Internet error. Please check your connection.")
        return ""

# --- FORM FILLING PROCESS ---

form_data = {}

fields = [
    ("your full name", "name"),
    ("your age", "age"),
    ("your email address", "email"),
    ("your city", "city"),
]

speak("Welcome to the voice-based form filling system.")

for question, key in fields:
    speak(f"Please say {question}")
    print(f"Please say {question}:")
    answer = listen()
    form_data[key] = answer
    time.sleep(1)

speak("Thank you. Now I will fill the form automatically.")

# Wait 3 seconds so you can click in a text field
time.sleep(3)

# Automatically fill using pyautogui
for key, value in form_data.items():
    pyautogui.typewrite(value)
    pyautogui.press('tab')
    time.sleep(0.5)

speak("Form filled successfully!")
print("✅ Form filled successfully!")
import speech_recognition as sr
import pyautogui
import pyttsx3
import time

# Initialize speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 160)  # Adjust speaking speed

def speak(text):
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen to user speech and convert to text"""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source, phrase_time_limit=8)
    try:
        text = r.recognize_google(audio)
        print(f"You said: {text}")
        return text
    except sr.UnknownValueError:
        speak("Sorry, I did not understand that.")
        return ""
    except sr.RequestError:
        speak("Internet error. Please check your connection.")
        return ""

# --- FORM FILLING PROCESS ---

form_data = {}

fields = [
    ("your full name", "name"),
    ("your age", "age"),
    ("your email address", "email"),
    ("your city", "city"),
]

speak("Welcome to the voice-based form filling system.")

for question, key in fields:
    speak(f"Please say {question}")
    print(f"Please say {question}:")
    answer = listen()
    form_data[key] = answer
    time.sleep(1)

speak("Thank you. Now I will fill the form automatically.")

# Wait 3 seconds so you can click in a text field
time.sleep(3)

# Automatically fill using pyautogui
for key, value in form_data.items():
    pyautogui.typewrite(value)
    pyautogui.press('tab')
    time.sleep(0.5)

speak("Form filled successfully!")
print("✅ Form filled successfully!")