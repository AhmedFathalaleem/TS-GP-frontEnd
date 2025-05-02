export interface HeartPredictionData {
  max_heart_rate: number;
  resting_bp: number;
  prediction_score: number;
  prediction_label: string;
  patient_id: number;
  age: number;
  gender: number;
  chest_pain_type: number;
  fasting_sugar: number;
  resting_ecg: number;
  exercise_angina: number;
  slope: number;
  day: number;
  month: any;
  hour: number;
}
