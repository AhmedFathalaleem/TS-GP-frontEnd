import asyncio
import json
import psycopg2
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

# WebSocket handler
async def stream_data(websocket):
    try:
        while True:
            data = get_latest_prediction_data(STATIC_PATIENT_ID)
            if data:
                await websocket.send(json.dumps(data))
            await asyncio.sleep(2)
    except websockets.exceptions.ConnectionClosedOK:
        print("🔌 Client disconnected (normal)")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"❌ Unexpected WebSocket close: {e}")
    except Exception as e:
        print(f"⚠️ Other error: {e}")


# Main entry
async def main():
    async with websockets.serve(stream_data, "localhost", 6789):
        print("🚀 WebSocket server is running on ws://localhost:6789")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("⛔ WebSocket stopped by user.")
    finally:
        cur.close()
        conn.close()
