import { WorkoutRecord, ActivityType, DeviceSource } from '../types';
import { estimateWorkoutCalories } from './calorieEngine';

export interface ParsedWorkoutResult {
  title: string;
  deviceSource: DeviceSource;
  activityType: ActivityType;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distanceKm?: number;
  elevationGainM?: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

/**
 * Parses TCX (Training Center XML) used by Coros, Polar Flow, and Garmin.
 */
export function parseTCX(tcxText: string, userWeightKg: number): ParsedWorkoutResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(tcxText, 'application/xml');

  // Sport detection
  const activityNode = xmlDoc.querySelector('Activity');
  const sportAttr = activityNode?.getAttribute('Sport')?.toLowerCase() || 'running';
  
  let activityType: ActivityType = 'running';
  if (sportAttr.includes('biking') || sportAttr.includes('cycling')) {
    activityType = 'cycling_road';
  } else if (sportAttr.includes('swimming') || sportAttr.includes('swim')) {
    activityType = 'swimming';
  } else if (sportAttr.includes('other') || sportAttr.includes('strength')) {
    activityType = 'strength_training';
  } else if (sportAttr.includes('trail')) {
    activityType = 'trail_running';
  }

  // Id/Date timestamp
  const idNode = xmlDoc.querySelector('Id') || xmlDoc.querySelector('Time');
  const timestampStr = idNode?.textContent || new Date().toISOString();
  const parsedDate = new Date(timestampStr);
  const dateStr = !isNaN(parsedDate.getTime()) 
    ? parsedDate.toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  const timeStr = !isNaN(parsedDate.getTime())
    ? parsedDate.toTimeString().slice(0, 5)
    : '08:00';

  // Total Time
  let totalSeconds = 0;
  const timeNodes = xmlDoc.querySelectorAll('TotalTimeSeconds');
  timeNodes.forEach(node => {
    totalSeconds += parseFloat(node.textContent || '0');
  });
  const durationMinutes = Math.max(1, Math.round(totalSeconds / 60)) || 45;

  // Distance
  let distanceMeters = 0;
  const distanceNodes = xmlDoc.querySelectorAll('DistanceMeters');
  distanceNodes.forEach(node => {
    distanceMeters += parseFloat(node.textContent || '0');
  });
  const distanceKm = distanceMeters > 0 ? parseFloat((distanceMeters / 1000).toFixed(2)) : undefined;

  // Calories
  let caloriesBurned = 0;
  const calNodes = xmlDoc.querySelectorAll('Calories');
  calNodes.forEach(node => {
    caloriesBurned += parseInt(node.textContent || '0', 10);
  });

  // Heart Rates
  let hrSum = 0;
  let hrCount = 0;
  let maxHr = 0;
  const avgHrNodes = xmlDoc.querySelectorAll('AverageHeartRateBpm Value');
  avgHrNodes.forEach(node => {
    const val = parseInt(node.textContent || '0', 10);
    if (val > 0) {
      hrSum += val;
      hrCount++;
    }
  });

  const maxHrNodes = xmlDoc.querySelectorAll('MaximumHeartRateBpm Value');
  maxHrNodes.forEach(node => {
    const val = parseInt(node.textContent || '0', 10);
    if (val > maxHr) maxHr = val;
  });

  const avgHeartRate = hrCount > 0 ? Math.round(hrSum / hrCount) : undefined;

  // Device detection from creator or metadata
  let deviceSource: DeviceSource = 'coros';
  const creatorNode = xmlDoc.querySelector('Creator Name')?.textContent?.toLowerCase() || '';
  if (creatorNode.includes('polar')) {
    deviceSource = 'polar';
  } else if (creatorNode.includes('apple')) {
    deviceSource = 'apple_fitness';
  } else if (creatorNode.includes('garmin')) {
    deviceSource = 'garmin';
  }

  // Calculate calories if 0 in file
  if (!caloriesBurned || caloriesBurned <= 0) {
    caloriesBurned = estimateWorkoutCalories(activityType, durationMinutes, userWeightKg, avgHeartRate);
  }

  const deviceLabel = deviceSource === 'coros' ? 'Coros' : deviceSource === 'polar' ? 'Polar' : 'Apple Watch';
  const typeLabel = activityType === 'running' ? 'Carrera' : activityType === 'trail_running' ? 'Trail Run' : 'Entrenamiento';

  return {
    title: `${typeLabel} (${deviceLabel})`,
    deviceSource,
    activityType,
    durationMinutes,
    caloriesBurned,
    avgHeartRate,
    maxHeartRate: maxHr > 0 ? maxHr : undefined,
    distanceKm,
    date: dateStr,
    time: timeStr
  };
}

/**
 * Parses GPX (GPS Exchange format).
 */
export function parseGPX(gpxText: string, userWeightKg: number): ParsedWorkoutResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, 'application/xml');

  const trkName = xmlDoc.querySelector('name')?.textContent || 'Entrenamiento GPX';
  const timeNode = xmlDoc.querySelector('time');
  const dateStr = timeNode?.textContent ? timeNode.textContent.split('T')[0] : new Date().toISOString().split('T')[0];
  const timeStr = timeNode?.textContent && timeNode.textContent.includes('T') ? timeNode.textContent.split('T')[1].slice(0, 5) : '07:30';

  // Calculate track length & duration from trackpoints
  const trkpts = xmlDoc.querySelectorAll('trkpt');
  let distanceKm = 0;
  let durationMinutes = 35;
  let elevationGainM = 0;

  if (trkpts.length > 1) {
    const firstTime = trkpts[0].querySelector('time')?.textContent;
    const lastTime = trkpts[trkpts.length - 1].querySelector('time')?.textContent;
    if (firstTime && lastTime) {
      const diffSec = (new Date(lastTime).getTime() - new Date(firstTime).getTime()) / 1000;
      if (diffSec > 0) durationMinutes = Math.round(diffSec / 60);
    }

    let prevEle = parseFloat(trkpts[0].querySelector('ele')?.textContent || '0');
    for (let i = 1; i < trkpts.length; i++) {
      const ele = parseFloat(trkpts[i].querySelector('ele')?.textContent || '0');
      if (ele > prevEle) elevationGainM += (ele - prevEle);
      prevEle = ele;
    }
  }

  const isTrail = elevationGainM > 100 || trkName.toLowerCase().includes('trail');
  const activityType: ActivityType = isTrail ? 'trail_running' : 'running';
  const caloriesBurned = estimateWorkoutCalories(activityType, durationMinutes, userWeightKg);

  return {
    title: trkName,
    deviceSource: 'coros',
    activityType,
    durationMinutes,
    caloriesBurned,
    distanceKm: distanceKm > 0 ? distanceKm : undefined,
    elevationGainM: elevationGainM > 0 ? Math.round(elevationGainM) : undefined,
    date: dateStr,
    time: timeStr
  };
}

/**
 * Parses JSON workout export (Apple Health / Coros export format).
 */
export function parseJSONWorkout(jsonText: string, userWeightKg: number): ParsedWorkoutResult {
  const data = JSON.parse(jsonText);

  const device = (data.device || data.source || 'apple_fitness').toLowerCase();
  const deviceSource: DeviceSource = device.includes('polar') 
    ? 'polar' 
    : device.includes('coros') 
    ? 'coros' 
    : 'apple_fitness';

  const duration = Number(data.durationMinutes || data.duration || (data.durationSeconds ? data.durationSeconds / 60 : 45));
  const calories = Number(data.caloriesBurned || data.activeCalories || data.calories || 0);

  const rawType = (data.activityType || data.type || data.workoutType || 'running').toLowerCase();
  let activityType: ActivityType = 'running';
  if (rawType.includes('cycle') || rawType.includes('bike') || rawType.includes('ciclismo')) {
    activityType = 'cycling_road';
  } else if (rawType.includes('strength') || rawType.includes('fuerza') || rawType.includes('pesa')) {
    activityType = 'strength_training';
  } else if (rawType.includes('hiit')) {
    activityType = 'hiit';
  } else if (rawType.includes('swim') || rawType.includes('natacion')) {
    activityType = 'swimming';
  } else if (rawType.includes('trail')) {
    activityType = 'trail_running';
  }

  const finalCalories = calories > 0 
    ? calories 
    : estimateWorkoutCalories(activityType, Math.round(duration), userWeightKg, data.avgHeartRate);

  return {
    title: data.name || data.title || `Sesión ${deviceSource.toUpperCase()}`,
    deviceSource,
    activityType,
    durationMinutes: Math.round(duration),
    caloriesBurned: Math.round(finalCalories),
    avgHeartRate: data.avgHeartRate ? Number(data.avgHeartRate) : undefined,
    maxHeartRate: data.maxHeartRate ? Number(data.maxHeartRate) : undefined,
    distanceKm: data.distanceKm ? Number(data.distanceKm) : undefined,
    elevationGainM: data.elevationGainM ? Number(data.elevationGainM) : undefined,
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '07:00'
  };
}

/**
 * Parses native Apple Health export.xml (from iOS Health app > Profile > Export all health data).
 */
export function parseAppleHealthXML(xmlText: string, userWeightKg: number): ParsedWorkoutResult[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const workoutNodes = xmlDoc.querySelectorAll('Workout');

  const results: ParsedWorkoutResult[] = [];

  workoutNodes.forEach((node) => {
    const rawType = (node.getAttribute('workoutActivityType') || '').toLowerCase();
    const durationMin = Math.round(parseFloat(node.getAttribute('duration') || '0'));
    const calories = Math.round(parseFloat(node.getAttribute('totalEnergyBurned') || '0'));
    const distance = parseFloat(node.getAttribute('totalDistance') || '0');
    const startDateStr = node.getAttribute('startDate') || '';

    let activityType: ActivityType = 'running';
    let title = 'Entrenamiento Apple Watch';

    if (rawType.includes('running')) {
      activityType = 'running';
      title = 'Carrera (Apple Fitness)';
    } else if (rawType.includes('cycling') || rawType.includes('biking')) {
      activityType = 'cycling_road';
      title = 'Ciclismo (Apple Fitness)';
    } else if (rawType.includes('strength') || rawType.includes('functional')) {
      activityType = 'strength_training';
      title = 'Fuerza / Pesas (Apple Fitness)';
    } else if (rawType.includes('highintensity') || rawType.includes('hiit')) {
      activityType = 'hiit';
      title = 'Sesión HIIT (Apple Fitness)';
    } else if (rawType.includes('swimming')) {
      activityType = 'swimming';
      title = 'Natación (Apple Fitness)';
    } else if (rawType.includes('walking')) {
      activityType = 'walking';
      title = 'Caminata (Apple Fitness)';
    }

    const datePart = startDateStr ? startDateStr.slice(0, 10) : new Date().toISOString().split('T')[0];
    const timePart = startDateStr && startDateStr.length >= 16 ? startDateStr.slice(11, 16) : '08:00';

    const finalCalories = calories > 0 ? calories : estimateWorkoutCalories(activityType, durationMin || 30, userWeightKg);

    results.push({
      title,
      deviceSource: 'apple_fitness',
      activityType,
      durationMinutes: Math.max(1, durationMin || 30),
      caloriesBurned: finalCalories,
      distanceKm: distance > 0 ? parseFloat(distance.toFixed(2)) : undefined,
      date: datePart,
      time: timePart
    });
  });

  return results;
}

/**
 * Converts a browser File to base64 string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Universal auto-dispatcher for workout files.
 */
export async function parseWorkoutFile(file: File, userWeightKg: number): Promise<ParsedWorkoutResult> {
  const fileName = file.name.toLowerCase();
  const text = await file.text();

  if (fileName.endsWith('.tcx')) {
    return parseTCX(text, userWeightKg);
  } else if (fileName.endsWith('.gpx')) {
    return parseGPX(text, userWeightKg);
  } else if (fileName.endsWith('.json')) {
    return parseJSONWorkout(text, userWeightKg);
  } else if (fileName.includes('export') && fileName.endsWith('.xml')) {
    const workouts = parseAppleHealthXML(text, userWeightKg);
    if (workouts.length > 0) {
      return workouts[workouts.length - 1]; // Return the latest workout
    }
  }

  // Fallback checks
  try {
    if (text.includes('<TrainingCenterDatabase') || text.includes('<Activity')) {
      return parseTCX(text, userWeightKg);
    }
    if (text.includes('<HealthData') || text.includes('<Workout')) {
      const workouts = parseAppleHealthXML(text, userWeightKg);
      if (workouts.length > 0) return workouts[workouts.length - 1];
    }
    return parseJSONWorkout(text, userWeightKg);
  } catch {
    throw new Error('Formato no reconocido. Sube un archivo .tcx, .gpx, .json o export.xml de Apple Health.');
  }
}
