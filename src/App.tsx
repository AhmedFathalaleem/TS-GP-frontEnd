import './App.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import NavBar from './components/ui/NavBar';
import DashBoardPage from './Pages/DashBoardPage';
import MessagesPage from './Pages/MessagesPage';

import { HeartPredictionData } from './types';

// Initial prediction state
const initialPrediction: HeartPredictionData = {
  patient_id: 0,
  max_heart_rate: 0,
  resting_bp: 0,
  prediction_score: 0,
  prediction_label: '',
  age: 0,
  gender: 0,
  chest_pain_type: 0,
  fasting_sugar: 0,
  resting_ecg: 0,
  exercise_angina: 0,
  slope: 0,
  day: 0,
  month: 0,
  hour: 0
};

function App() {
  const [heartRate, setHeartRate] = useState<number>(0);
  const [bloodPressure, setBloodPressure] = useState<number>(0);
  const [predictionData, setPredictionData] = useState<HeartPredictionData>(initialPrediction);

  const [scores, setScores] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [predictionLabel, setPredictionLabel] = useState<string>('');

  const [atRiskMessages, setAtRiskMessages] = useState<HeartPredictionData[]>([]);
  const [newAtRiskNotification, setNewAtRiskNotification] = useState<boolean>(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('✅ Connected to Flask-SocketIO server');
    });

    let lastUpdateTime = Date.now();

socket.on('prediction_update', (data) => {
  const now = Date.now();
  if (now - lastUpdateTime >= 2000) { // 2 seconds
    lastUpdateTime = now;

    console.log('📡 Throttled data received:', data);

    setHeartRate(data.max_heart_rate);
    setBloodPressure(data.resting_bp);
    setPredictionLabel(data.prediction_label);

    setPredictionData({
      ...data
    });

    setScores((prev) => [...prev, data.prediction_score]);
    setLabels((prev) => [...prev, new Date().toLocaleTimeString()]);
  }
});


    socket.on('at_risk_alert', (data) => {
      setAtRiskMessages((prev) => [...prev, data]);
      setNewAtRiskNotification(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Wrapper to handle NavBar click with routing support
  const MainLayout = () => {
    const navigate = useNavigate();

    const handleNavClick = (section: number) => {
      if (section === 0) navigate('/');
      if (section === 2) {
        setNewAtRiskNotification(false);
        navigate('/messages');
      }
    };

    return (
      <div className="flex min-h-screen">
        {/* Left Sidebar (NavBar) */}
        <div className="w-64 bg-[#4169E1] text-white flex-shrink-0">

          <NavBar setActiveSection={handleNavClick} newAtRiskNotification={newAtRiskNotification} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 bg-gray-100">
          <Routes>
            <Route
              path="/"
              element={
                <DashBoardPage
                  heartRate={heartRate}
                  bloodPressure={bloodPressure}
                  scores={scores}
                  labels={labels}
                  predictionLabel={predictionLabel}
                  predictionData={predictionData}
                />
              }
            />
            <Route path="/messages" element={<MessagesPage messages={atRiskMessages} />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
