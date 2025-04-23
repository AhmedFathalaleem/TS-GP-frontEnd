import asyncio
import random
import json
import psycopg2
from datetime import datetime
import websockets

# Database connection
conn = psycopg2.connect(
    host="localhost",
    dbname="DW",
    user="postgres",
    password="189569420",
    port="5432"
)
conn.autocommit = True
cur = conn.cursor()

STATIC_PATIENT_ID = 15

# Insert into dim_patient only once
def insert_dim_patient(patient_id):
    query = """
    INSERT INTO dim_patient (patient_id, age, gender, chest_pain_type, fasting_sugar, resting_ecg, exercise_angina, slope)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (patient_id) DO NOTHING;
    """
    values = (
        patient_id,
        random.randint(30, 80),
        random.randint(0, 1),
        random.randint(0, 3),
        random.randint(0, 1),
        random.randint(0, 2),
        random.randint(0, 1),
        random.randint(1, 3)
    )
    cur.execute(query, values)

def insert_dim_time():
    now = datetime.now()
    query = """
    INSERT INTO dim_time (date, day, month, year, hour, day_of_week)
    VALUES (%s, %s, %s, %s, %s, %s)
    RETURNING time_id;
    """
    values = (
        now.date(),
        now.day,
        now.month,
        now.year,
        now.hour,
        now.weekday()
    )
    cur.execute(query, values)
    return cur.fetchone()[0]








baseline_vitals = {
    "resting_bp": 120,
    "cholesterol": 200,
    "max_heart_rate": 150,
    "oldpeak": 1.0
}

def fluctuate(value, min_val, max_val, max_delta):
    delta = random.uniform(-max_delta, max_delta)
    new_value = value + delta
    return max(min_val, min(max_val, new_value))



# Define this outside the function, as persistent state
previous_vitals = baseline_vitals.copy()

def insert_fact_prediction(patient_id, time_id):
    global previous_vitals  # Keep track of previous state

    # Simulate small fluctuations
    previous_vitals["resting_bp"] = fluctuate(previous_vitals["resting_bp"], 90, 140, 3)
    previous_vitals["cholesterol"] = fluctuate(previous_vitals["cholesterol"], 150, 250, 5)
    previous_vitals["max_heart_rate"] = fluctuate(previous_vitals["max_heart_rate"], 100, 190, 4)
    previous_vitals["oldpeak"] = round(fluctuate(previous_vitals["oldpeak"], 0.0, 4.0, 0.2), 1)

    # Simulate label and score
    prediction_label = 1 if previous_vitals["oldpeak"] > 2.5 or previous_vitals["resting_bp"] > 130 else 0
    prediction_score = round(random.uniform(0.5, 1.0) if prediction_label else random.uniform(0.1, 0.5), 2)

    query = """INSERT INTO fact_predictions (
        patient_id, time_id, resting_bp, cholesterol, max_heart_rate, oldpeak, prediction_label, prediction_score
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);"""

    values = (
        patient_id,
        time_id,
        int(previous_vitals["resting_bp"]),
        int(previous_vitals["cholesterol"]),
        int(previous_vitals["max_heart_rate"]),
        previous_vitals["oldpeak"],
        prediction_label,
        prediction_score
    )
    cur.execute(query, values)


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
            "hour": row[15],
        }
    return {}




# Background task: Insert data every 2s
async def generate_data():
    insert_dim_patient(STATIC_PATIENT_ID)
    while True:
        time_id = insert_dim_time()
        insert_fact_prediction(STATIC_PATIENT_ID, time_id)
        print(f"✅ Inserted prediction for patient_id {STATIC_PATIENT_ID} and time_id {time_id}")
        await asyncio.sleep(2)

# WebSocket handler
async def stream_data(websocket):
    while True:
        data = get_latest_prediction_data(STATIC_PATIENT_ID)
        if data:
            await websocket.send(json.dumps(data))
        await asyncio.sleep(2)


# Main entry
async def main():
    websocket_server = websockets.serve(stream_data, "localhost", 6789)
    await asyncio.gather(
        websocket_server,
        generate_data()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("⛔ Stopped by user.")
    finally:
        cur.close()
        conn.close()
