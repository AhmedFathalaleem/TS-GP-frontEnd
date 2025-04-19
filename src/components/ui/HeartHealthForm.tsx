import { HeartPredictionData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  data: HeartPredictionData;
};

export function HeartHealthForm({ data }: Props) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-5">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Patient Data</h2>

      <div className="space-y-3">
        {[
          { label: "Patient ID", value: data.patient_id },
          { label: "Resting Blood Pressure", value: data.resting_bp },
          { label: "Cholesterol", value: data.cholesterol },
          { label: "Max Heart Rate", value: data.max_heart_rate },
          { label: "Oldpeak", value: data.oldpeak },
          { label: "Prediction Score", value: data.prediction_score },
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

        <div>
          <Label className="text-gray-600">Prediction</Label>
          <Input
            className={`mt-1 font-semibold ${
              data.prediction_label === 1 ? "text-red-600" : "text-green-600"
            }`}
            value={data.prediction_label === 1 ? "At Risk" : "Healthy"}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
