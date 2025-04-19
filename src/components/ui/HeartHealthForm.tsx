import { HeartPredictionData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  data: HeartPredictionData;
};

export function HeartHealthForm({ data }: Props) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-5">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Patient Info</h2>

      <div className="space-y-3">
        {[
          { label: "Patient ID", value: data.patient_id },
          { label: "Age", value: data.age },
          { label: "Gender", value: data.gender === 1 ? "Male" : "Female" },
          { label: "Chest Pain Type", value: data.chest_pain_type },
          { label: "Fasting Sugar", value: data.fasting_sugar === 1 ? "Yes" : "No" },
          { label: "Resting ECG", value: data.resting_ecg },
          { label: "Exercise Angina", value: data.exercise_angina === 1 ? "Yes" : "No" },
          { label: "Slope", value: data.slope },
        ].map((field) => (
          <div key={field.label}>
            <Label className="text-gray-600">{field.label}</Label>
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
