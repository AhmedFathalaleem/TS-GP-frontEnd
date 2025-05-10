import psycopg2
import random
import time
from datetime import datetime

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

# Use a static patient ID
STATIC_PATIENT_ID = 31  # Replace with a valid patient ID from your database

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
        random.randint(90, 200),
        random.randint(100, 400),  # Avoid cholesterol = 0
        random.randint(70, 220),
        round(random.uniform(0.0, 6.0), 1),
        random.randint(0, 1),
        round(random.uniform(0.5, 1.0), 2)
    )
    cur.execute(query, values)

try:
    insert_dim_patient(STATIC_PATIENT_ID)  # Insert once at the beginning
    while True:
        time_id = insert_dim_time()
        insert_fact_prediction(STATIC_PATIENT_ID, time_id)
        print(f"✅ Inserted prediction for patient_id {STATIC_PATIENT_ID} and time_id {time_id}")
        time.sleep(2)

except KeyboardInterrupt:
    print("⛔ Stopped by user.")

finally:
    cur.close()
    conn.close()
