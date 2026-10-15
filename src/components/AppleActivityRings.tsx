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
          {/* Outer Ring: Athletic Electric Volt Lime */}
          <linearGradient id="moveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCFF00" />
            <stop offset="100%" stopColor="#A6E600" />
          </linearGradient>

          {/* Middle Ring: Cyber Cyan */}
          <linearGradient id="exerciseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0099FF" />
          </linearGradient>

          {/* Inner Ring: Fire Amber / Orange */}
          <linearGradient id="nutritionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FF5722" />
          </linearGradient>

        </defs>

        {/* --- Background Tracks (Dark Charcoal) --- */}
        {/* Outer: Move / Steps */}
        <circle
          cx={center}
          cy={center}
          r={rMove}
          fill="none"
          stroke="#CCFF00"
          strokeWidth={strokeWidth}
          className="opacity-[0.14]"
        />

        {/* Middle: Exercise */}
        <circle
          cx={center}
          cy={center}
          r={rExercise}
          fill="none"
          stroke="#00F0FF"
          strokeWidth={strokeWidth}
          className="opacity-[0.14]"
        />

        {/* Inner: Nutrition / Protein */}
        <circle
          cx={center}
          cy={center}
          r={rNutrition}
          fill="none"
          stroke="#FF9500"
          strokeWidth={strokeWidth}
          className="opacity-[0.14]"
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
