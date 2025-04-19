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

STATIC_PATIENT_ID = 14

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

def insert_fact_prediction(patient_id, time_id):
    query = """
    INSERT INTO fact_predictions (patient_id, time_id, resting_bp, cholesterol, max_heart_rate, oldpeak, prediction_label, prediction_score)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (
        patient_id,
        time_id,
        random.randint(90, 200),  #BP
        random.randint(100, 400),# Cholesterol
        random.randint(70, 220), #Max Heart Rate
        round(random.uniform(0.0, 6.0), 1),
        random.randint(0, 1),
        round(random.uniform(0.5, 1.0), 2)
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
