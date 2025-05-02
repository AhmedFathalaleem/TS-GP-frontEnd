from flask import Flask
from flask_socketio import SocketIO
import psycopg2
import json
import threading
import time

# Flask app and SocketIO setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins for testing

# PostgreSQL connection
conn = psycopg2.connect(
    host="localhost",
    dbname="DW",
    user="postgres",
    password="189569420",
    port="5432"
)
conn.autocommit = True
cur = conn.cursor()

STATIC_PATIENT_ID = 12

def get_latest_prediction_data(patient_id):
    cur.execute("""
        SELECT 
            p.patient_id,
            p.age,
            p.gender,
            p.chest_pain_type,
            p.fasting_sugar,
            p.resting_ecg,
            p.exercise_angina,
            p.slope,
            f.resting_bp,
            f.cholesterol,
            f.max_heart_rate,
            f.oldpeak,
            f.prediction_score,
            f.prediction_label,
            t.day,
            t.month,
            t.hour
        FROM dim_patient p
        JOIN fact_predictions f ON p.patient_id = f.patient_id
        JOIN dim_time t ON f.time_id = t.time_id
        WHERE p.patient_id = %s
        ORDER BY f.time_id DESC
        LIMIT 1;
    """, (patient_id,))
    
    row = cur.fetchone()
    if row:
        return {
            "patient_id": row[0],
            "age": row[1],
            "gender": row[2],
            "chest_pain_type": row[3],
            "fasting_sugar": row[4],
            "resting_ecg": row[5],
            "exercise_angina": row[6],
            "slope": row[7],
            "resting_bp": row[8],
            "cholesterol": row[9],
            "max_heart_rate": row[10],
            "oldpeak": row[11],
            "prediction_score": row[12],
            "prediction_label": row[13],
            "day": row[14],
            "month": row[15],
            "hour": row[16],
        }
    return {}

# Background thread to emit data every 2 seconds
def background_thread():
    last_seen_score = None
    while True:
        data = get_latest_prediction_data(STATIC_PATIENT_ID)
        if data:
            socketio.emit('prediction_update', data)

            # If it's a new at-risk prediction
            if data["prediction_score"] >= 0.8 and data["prediction_score"] != last_seen_score:
                socketio.emit('at_risk_alert', data)
                last_seen_score = data["prediction_score"]

        time.sleep(2)


# Start background thread when a client connects
@socketio.on('connect')
def handle_connect():
    print("✅ Client connected")
    threading.Thread(target=background_thread).start()

@socketio.on('disconnect')
def handle_disconnect():
    print("🔌 Client disconnected")

# Run the server
if __name__ == '__main__':
    try:
        print("🚀 Flask-SocketIO server running on http://localhost:5000")
        socketio.run(app, host="0.0.0.0", port=5000)
    finally:
        cur.close()
        conn.close()
