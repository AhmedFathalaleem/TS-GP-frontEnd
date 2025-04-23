import './App.css';
import StatCard from './components/ui/StatCard';
import { HeartHealthForm } from './components/ui/HeartHealthForm';
import RiskChart from './components/ui/RiskChart';
import { HeartPredictionData } from './types';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import NavBar from './components/ui/NavBar';

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
  day: 0,
  hour: 0
};

function App() {
  const [heartRate, setHeartRate] = useState<number>(0);
  const [bloodPressure, setBloodPressure] = useState<number>(0);
  const [predictionData, setPredictionData] = useState<HeartPredictionData>(initialPrediction);

  // For tracking the risk score over time
  const [scores, setScores] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [predictionLabel, setPredictionLabel] = useState<string>('');

  // For the NavBar
  const [activeSection, setActiveSection] = useState<number>(0);

  // Render the correct section based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return <h2>Dashboard</h2>;
      case 1:
        return <h2>Profile</h2>;
      case 2:
        return <h2>Messages</h2>;
      case 3:
        return <h2>Settings</h2>;
      default:
        return <h2>Dashboard</h2>;
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:5000'); // ✅ Connect to Flask-SocketIO

    socket.on('connect', () => {
      console.log('✅ Connected to Flask-SocketIO server');
    });

    socket.on('prediction_update', (data) => {
      console.log('📡 Data received:', data);

      setHeartRate(data.max_heart_rate);
      setBloodPressure(data.resting_bp);
      setPredictionLabel(data.prediction_label);

      setPredictionData({
        patient_id: data.patient_id,
        age: data.age,
        gender: data.gender,
        chest_pain_type: data.chest_pain_type,
        fasting_sugar: data.fasting_sugar,
        resting_ecg: data.resting_ecg,
        exercise_angina: data.exercise_angina,
        slope: data.slope,
        day: data.day,
        hour: data.hour,
      });

      setScores((prev) => [...prev, data.prediction_score]);
      setLabels((prev) => [...prev, new Date().toLocaleTimeString()]);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex">
      {/* Left Sidebar (NavBar) */}
      <div className="w-64 h-screen bg-gray-800 text-white">
        <NavBar setActiveSection={setActiveSection} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-semibold text-center mb-6 mr-125">Heart Attack Prediction</h1>

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
              <RiskChart scores={scores} labels={labels} predictionLabel={predictionLabel} />
            </div>
          </div>

          {/* Form on the right */}
          <div className="w-1/3">
            <HeartHealthForm data={predictionData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
