import React from 'react';

interface AppleActivityRingsProps {
  moveCurrent: number;    // Calories burned today
  moveTarget: number;     // Target calories (e.g. 2400)
  exerciseCurrent: number; // Workout minutes today
  exerciseTarget: number;  // Target minutes (e.g. 45)
  nutritionCurrent: number; // Protein grams consumed
  nutritionTarget: number;  // Target protein grams (e.g. 160)
  size?: number;
}

export const AppleActivityRings: React.FC<AppleActivityRingsProps> = ({
  moveCurrent,
  moveTarget,
  exerciseCurrent,
  exerciseTarget,
  nutritionCurrent,
  nutritionTarget,
  size = 170
}) => {
  const center = size / 2;
  const strokeWidth = size * 0.082; // proportional stroke width

  // Radii for the 3 concentric rings
  const rMove = center - strokeWidth;
  const rExercise = rMove - strokeWidth * 1.35;
  const rNutrition = rExercise - strokeWidth * 1.35;

  const circumMove = 2 * Math.PI * rMove;
  const circumExercise = 2 * Math.PI * rExercise;
  const circumNutrition = 2 * Math.PI * rNutrition;

  // Normalized progress (clamped to at least 0.02 for visibility)
  const pctMove = Math.min(2.0, Math.max(0.01, moveCurrent / (moveTarget || 1)));
  const pctExercise = Math.min(2.0, Math.max(0.01, exerciseCurrent / (exerciseTarget || 1)));
  const pctNutrition = Math.min(2.0, Math.max(0.01, nutritionCurrent / (nutritionTarget || 1)));

  const offsetMove = circumMove * (1 - pctMove);
  const offsetExercise = circumExercise * (1 - pctExercise);
  const offsetNutrition = circumNutrition * (1 - pctNutrition);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <defs>
          {/* Outer Ring: Apple Move Rose Red */}
          <linearGradient id="moveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FA114F" />
            <stop offset="100%" stopColor="#FF2D55" />
          </linearGradient>

          {/* Middle Ring: Apple Exercise Green */}
          <linearGradient id="exerciseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#30D158" />
            <stop offset="100%" stopColor="#34C759" />
          </linearGradient>

          {/* Inner Ring: Apple Stand / Cyan */}
          <linearGradient id="nutritionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0A84FF" />
          </linearGradient>

        </defs>

        {/* --- Background Tracks (Dark Charcoal) --- */}
        {/* Outer: Move / Steps */}
        <circle
          cx={center}
          cy={center}
          r={rMove}
          fill="none"
          stroke="#FA114F"
          strokeWidth={strokeWidth}
          className="opacity-[0.16]"
        />

        {/* Middle: Exercise */}
        <circle
          cx={center}
          cy={center}
          r={rExercise}
          fill="none"
          stroke="#30D158"
          strokeWidth={strokeWidth}
          className="opacity-[0.16]"
        />

        {/* Inner: Nutrition / Stand */}
        <circle
          cx={center}
          cy={center}
          r={rNutrition}
          fill="none"
          stroke="#00F0FF"
          strokeWidth={strokeWidth}
          className="opacity-[0.16]"
        />

        {/* --- Active Animated Rings --- */}
        {/* Outer: Move / Calories */}
        <circle
          cx={center}
          cy={center}
          r={rMove}
          fill="none"
          stroke="url(#moveGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumMove}
          strokeDashoffset={offsetMove}
          className="transition-all duration-700 ease-out"
        />

        {/* Middle: Exercise */}
        <circle
          cx={center}
          cy={center}
          r={rExercise}
          fill="none"
          stroke="url(#exerciseGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumExercise}
          strokeDashoffset={offsetExercise}
          className="transition-all duration-700 ease-out"
        />

        {/* Inner: Nutrition */}
        <circle
          cx={center}
          cy={center}
          r={rNutrition}
          fill="none"
          stroke="url(#nutritionGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumNutrition}
          strokeDashoffset={offsetNutrition}
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
};
