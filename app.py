from flask import Flask, render_template, request, jsonify
import json, os

# Use project root as template folder because HTML files live in project root
app = Flask(__name__, template_folder='.')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/faculty')
def faculty():
    return render_template('faculty.html')

@app.route('/student')
def student():
    return render_template('student.html')

@app.route('/save', methods=['POST'])
def save():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    os.makedirs("data", exist_ok=True)
    with open("data/submissions.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")

    return jsonify({"status": "success", "message": "✅ Data saved successfully!"})

if __name__ == '__main__':
    app.run(debug=True)