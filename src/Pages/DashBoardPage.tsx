import StatCard from '../components/ui/StatCard';
import RiskChart from '../components/ui/RiskChart';
import { HeartHealthForm } from '../components/ui/HeartHealthForm';
import { HeartPredictionData } from '../types';

interface DashboardPageProps {
  heartRate: number;
  bloodPressure: number;
  scores: number[];
  labels: string[];
  predictionLabel: string;
  predictionData: HeartPredictionData;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  heartRate,
  bloodPressure,
  scores,
  labels,
  predictionLabel,
  predictionData
}) => (
  <div>
    <div className='w-full h-13  bg-white'></div>
    <h1 className="text-4xl font-semibold text-center mt-2 mr-120">Heart Attack Prediction</h1>

    <div className="flex p-6 space-x-6">
      <div className="flex flex-col w-2/3 space-y-6">
        <div className="flex space-x-6">
          <StatCard label="Heart Rate" value={heartRate} icon="❤️" />
          <StatCard label="Blood Pressure" value={bloodPressure} icon="📈" />
        </div>
        <div className="w-full h-full">
          <RiskChart scores={scores} labels={labels} predictionLabel={predictionLabel} />
        </div>
      </div>
      <div className="w-1/3">
        <HeartHealthForm data={predictionData} />
      </div>
    </div>
  </div>
);

export default DashboardPage;
