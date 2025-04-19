import './App.css'
import StatCard from './components/ui/StatCard'
import { HeartHealthForm } from './components/ui/HeartHealthForm'
import RiskChart from './components/ui/RiskChart'
import { HeartPredictionData } from './types'
import { useEffect, useState } from 'react';


// Initial state type
const initialPrediction: HeartPredictionData = {
  patient_id: 0,
  age: 0,
  gender: 0,
  chest_pain_type: 0,
  fasting_sugar: 0,
  resting_ecg: 0,
  exercise_angina: 0,
  slope: 0,
};


function App() {
  const [heartRate, setHeartRate] = useState<number>(0);
  const [bloodPressure, setBloodPressure] = useState<number>(0);
  const [predictionData, setPredictionData] = useState<HeartPredictionData>(initialPrediction);


  // For tracking the risk score over time
  const [scores, setScores] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [predictionLabel, setPredictionLabel] = useState<string>('');


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:6789');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //Real Time vital signs
      setHeartRate(data.max_heart_rate);
      setBloodPressure(data.resting_bp);


      // Set prediction label
    setPredictionLabel(data.prediction_label);  

      // Patient Data form
    setPredictionData({
      patient_id: data.patient_id,
    age: data.age,
    gender: data.gender,
    chest_pain_type: data.chest_pain_type,
    fasting_sugar: data.fasting_sugar,
    resting_ecg: data.resting_ecg,
    exercise_angina: data.exercise_angina,
    slope: data.slope,
    });

    // Update the risk score chart data
    setScores((prevScores) => [...prevScores, data.prediction_score]);
    setLabels((prevLabels) => [...prevLabels, new Date().toLocaleTimeString()]);
    

    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);



  return (
    <>
  <div className="max-w-screen-xl mx-auto p-6">
    <h1 className="text-4xl font-semibold text-center mb-6">Heart Attack Prediction</h1>

    {/* Main container with flexbox to align cards, chart, and form */}
    <div className="flex space-x-6">
      {/* Left side (cards + chart) */}
      <div className="flex flex-col w-2/3 space-y-6">
        {/* Heart Rate and Blood Pressure Cards */}
        <div className="flex space-x-6">
          <StatCard label="Heart Rate" value={heartRate} icon="❤️" />
          <StatCard label="Blood Pressure" value={bloodPressure} icon="📈" />
        </div>

        {/* Risk Chart centered under the cards */}
        <div className="w-full max-w-4xl">
          <RiskChart
            scores={scores}
            labels={labels}
            predictionLabel={predictionLabel}
          />
        </div>
      </div>

      {/* Form on the right */}
      <div className="w-1/3">
        <HeartHealthForm data={predictionData} />
      </div>
    </div>
  </div>
</>
  

  )
}

export default App
