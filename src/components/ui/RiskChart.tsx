// src/components/ui/RiskChart.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

type RiskChartProps = {
  scores: number[];
  labels: string[];
  predictionLabel: number;
};

export default function RiskChart({ scores, labels, predictionLabel }: RiskChartProps) {
  const riskText = predictionLabel === 1 ? 'HIGH RISK' : 'LOW RISK';
  const riskColor = predictionLabel === 1 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800';

  const data = {
    labels,
    datasets: [
      {
        label: 'Risk Score',
        data: scores,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        suggestedMin: 0.5,
        suggestedMax: 1.0,
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Risk Score Over Time</h2>
      <Line data={data} options={options} />
      <div className={`text-center text-lg font-semibold py-2 rounded ${riskColor}`}>
        {riskText}
      </div>
    </div>
  );
}
