// src/components/ui/RiskChart.tsx
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type RiskChartProps = {
  scores: number[];
  labels: string[];
  predictionLabel: string;
};

export default function RiskChart({ scores, labels }: RiskChartProps) {
  const latestScore = scores[scores.length - 1] || 0;
  const isHighRisk = latestScore >= 0.8;
  const riskText = isHighRisk ? 'HIGH RISK' : 'LOW RISK';
  const riskColor = isHighRisk ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800';

  const VISIBLE_POINTS = 10;
  const slicedScores = useMemo(() => scores.slice(-VISIBLE_POINTS), [scores]);
  const slicedLabels = useMemo(() => labels.slice(-VISIBLE_POINTS), [labels]);

  const data = useMemo(() => ({
    labels: slicedLabels,
    datasets: [
      {
        label: 'Risk Score',
        data: slicedScores,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.3)',
        tension: 0.4,
        fill:'start',
      },
    ],
  }), [slicedLabels, slicedScores]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        suggestedMin: 0.4,
        suggestedMax: 1.0,
        ticks: {
          stepSize: 0.2,
        },
      },
    },
  }), []);

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-full mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-blue-500">Risk Score Over Time</h2>
      <div className="h-80"> {/* Set height to prevent layout shift */}
        <Line data={data} options={options} />
      </div>
      <div className={`text-center text-4xl font-semibold py-2 rounded ${riskColor}`}>
        {riskText}
      </div>
    </div>
  );
}
