from pyngrok import ngrok
import time
import os

os.makedirs(os.path.dirname(__file__), exist_ok=True)

# Start an HTTP tunnel on port 5000
tunnel = ngrok.connect(5000, "http")
url = tunnel.public_url

# Write the public URL to a file so other processes can read it
out_path = os.path.join(os.path.dirname(__file__), '..', 'ngrok_url.txt')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(url)

print("Ngrok tunnel started:", url)
print("Public URL written to:", out_path)
print("Tunnel will keep running until this process is stopped.")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Shutting down tunnel...")
    ngrok.disconnect(url)
    ngrok.kill()
