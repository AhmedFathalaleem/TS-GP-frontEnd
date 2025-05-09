import React from 'react';
import { HeartPredictionData } from '../types';

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type Props = {
  messages: HeartPredictionData[];
};

const MessagesPage: React.FC<Props> = ({ messages }) => {
  return (
    <div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Heart Rate</th>
              <th className="px-4 py-2">Blood Pressure</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, idx) => {
              const isHighRisk = msg.prediction_score >= 0.8;

              // Format the hour with AM/PM
              const hour12 = msg.hour % 12 === 0 ? 12 : msg.hour % 12;
              const ampm = msg.hour >= 12 ? 'PM' : 'AM';
              const formattedTime = `${hour12} ${ampm}, ${monthNames[msg.month]} ${msg.day}`;

              return (
                <tr key={idx} className="text-center bg-white  hover:bg-gray-100">
                  <td className="border px-4 py-2">{formattedTime}</td>
                  <td className="border px-4 py-2">{msg.max_heart_rate}</td>
                  <td className="border px-4 py-2">{msg.resting_bp}</td>
                  <td className="border px-4 py-2 text-red-600 font-bold">{msg.prediction_score.toFixed(2)}</td>
                  <td className={`border px-4 py-2 font-semibold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
                    {isHighRisk ? 'High Risk' : 'Low Risk'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagesPage;
