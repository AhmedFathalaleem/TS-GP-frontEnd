import { useEffect, useRef, useState, useMemo } from 'react';
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
import type { ChartData, ChartOptions, Chart } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type RiskChartProps = {
  scores: number[];
  labels: string[];
  predictionLabel: string;
  fillOpacity?: number; // Control fill transparency
  lineColor?: string;   // Control line color
  fillColor?: string;   // Control fill color (base color before transparency)
};

export default function RiskChart({ 
  scores, 
  labels, 
  fillOpacity = 0.1, 
  lineColor = 'rgba(65,105,225,255)',  // Default teal color
  fillColor = 'rgba(65,105,225,255)'   // Default same as line color
}: RiskChartProps) {
  const chartRef = useRef<Chart<'line'> | null>(null);
  
  // Extract RGB components for creating the background color with opacity
  const rgbMatch = fillColor.match(/\d+/g);
  let backgroundColor = `rgba(75, 192, 192, ${fillOpacity})`;
  
  // If we successfully parsed the RGB values, create the RGBA color
  if (rgbMatch && rgbMatch.length >= 3) {
    backgroundColor = `rgba(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}, ${fillOpacity})`;
  }
  
  // Store the processed data in state to avoid recalculations
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: new Array(10).fill(""),
    datasets: [
      {
        label: 'Risk Score',
        data: new Array(10).fill(null),
        borderColor: lineColor,
        backgroundColor: backgroundColor,
        tension: 0.4,
        fill: 'start',
      },
    ],
  });

  const VISIBLE_POINTS = 10;
  
  const latestScore = scores[scores.length - 1] ?? 0;
  const isHighRisk = latestScore >= 0.8;
  const riskText = isHighRisk ? 'HIGH RISK' : 'LOW RISK';
  const riskColor = isHighRisk ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800';

  // Use memo to prevent unnecessary recalculations of chart options
  const options = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: VISIBLE_POINTS,
        },
      },
      y: {
        suggestedMin: 0.4,
        suggestedMax: 1.0,
        ticks: {
          stepSize: 0.2,
        },
      },
    },
  }), []);

  // Use useEffect to update chart data only when scores or labels actually change
  useEffect(() => {
    if (scores.length === 0) return;
    
    const slicedScores = scores.slice(-VISIBLE_POINTS);
    const slicedLabels = labels.slice(-VISIBLE_POINTS);
    
    // Create new data object only when data has actually changed
    setChartData({
      labels: slicedLabels,
      datasets: [
        {
          label: 'Risk Score',
          data: slicedScores,
          borderColor: lineColor,
          backgroundColor: backgroundColor,
          tension: 0.4,
          fill: 'start',
        },
      ],
    });
  }, [scores, labels, lineColor, backgroundColor]);

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-full mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-blue-500">Risk Score Over Time</h2>
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      <div className={`text-center text-4xl font-semibold py-2 rounded ${riskColor}`}>
        {riskText}
      </div>
    </div>
  );
}