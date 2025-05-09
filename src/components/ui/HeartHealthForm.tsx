import { HeartPredictionData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  data: HeartPredictionData;
};

export function HeartHealthForm({ data }: Props) {
  // Helper functions or mappings
  const getChestPainType = (value: number) => {
    switch (value) {
      case 0: return "Typical angina";
      case 1: return "Atypical angina";
      case 2: return "Non-anginal pain";
      case 3: return "Asymptomatic";
      default: return "Unknown";
    }
  };

  const getRestingECG = (value: number) => {
    switch (value) {
      case 0: return "Normal";
      case 1: return "ST-T wave abnormality";
      case 2: return "Left ventricular hypertrophy";
      default: return "Unknown";
    }
  };

  const getSlope = (value: number) => {
    switch (value) {
      case 1: return "Upsloping";
      case 2: return "Flat";
      case 3: return "Downsloping";
      default: return "Unknown";
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-5">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Patient Info</h2>

      <div className="space-y-3">
        {[
          { label: "Patient SSN", value: data.patient_id },
          { label: "Age", value: data.age },
          { label: "Gender", value: data.gender === 1 ? "Male" : "Female" },
          { label: "Chest Pain Type", value: getChestPainType(data.chest_pain_type) },
          { label: "Fasting Sugar", value: data.fasting_sugar === 1 ? "Yes" : "No" },
          { label: "Resting ECG", value: getRestingECG(data.resting_ecg) },
          { label: "Exercise Angina", value: data.exercise_angina === 1 ? "Yes" : "No" },
          { label: "Slope", value: getSlope(data.slope) },
        ].map((field) => (
          <div key={field.label}>
            <Label className="text-gray-600 text-lg">{field.label}</Label>
            <Input
              className="mt-1"
              value={field.value}
              readOnly
            />
          </div>
        ))}
      </div>
    </div>
  );
}
