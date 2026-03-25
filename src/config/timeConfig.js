// ============================================
// CONFIGURAÇÃO DE TEMPO SIMPLES E FUNCIONAL
// ============================================

export const timeConfig = {
  cycleDuration: 360,        // 6 minutos ciclo completo
  autoCycle: true,
  weatherEventChance: 0.3,
};

// CORES DO CÉU (simples)
export const skyColors = {
  night:  [0.02, 0.00, 0.12],
  sunrise: [0.85, 0.45, 0.25],
  day:    [0.45, 0.70, 1.00],
  sunset: [0.90, 0.45, 0.25],
};

// CORES DA LUZ
export const sunColors = {
  night:   { color: [0.10, 0.10, 0.30], intensity: 0.08 },
  sunrise: { color: [1.00, 0.55, 0.35], intensity: 0.85 },
  day:     { color: [1.00, 0.95, 0.85], intensity: 1.40 },
  sunset:  { color: [1.00, 0.60, 0.35], intensity: 0.85 },
};

// CLIMAS
export const weatherEvents = {
  clear:   { name: '☀️', fog: 0.008, wind: 0.3, sun: 1.0, particles: null },
  cloudy:  { name: '☁️', fog: 0.018, wind: 0.5, sun: 0.7, particles: null },
  foggy:   { name: '🌫️', fog: 0.045, wind: 0.2, sun: 0.5, particles: null },
  windy:   { name: '💨', fog: 0.012, wind: 1.2, sun: 0.9, particles: null },
  rainy:   { name: '🌧️', fog: 0.028, wind: 0.8, sun: 0.6, particles: 'rain' },
  snowy:   { name: '❄️', fog: 0.025, wind: 0.6, sun: 0.7, particles: 'snow' },
};

// FUNÇÕES SIMPLES
export const getSkyColor = (t) => {
  if (t < 0.2) return skyColors.night;
  if (t < 0.3) return skyColors.sunrise;
  if (t < 0.7) return skyColors.day;
  if (t < 0.8) return skyColors.sunset;
  return skyColors.night;
};

export const getSunData = (t, weather = 'clear') => {
  let sunData;
  if (t < 0.2) sunData = sunColors.night;
  else if (t < 0.3) sunData = sunColors.sunrise;
  else if (t < 0.7) sunData = sunColors.day;
  else if (t < 0.8) sunData = sunColors.sunset;
  else sunData = sunColors.night;
  
  const weatherMod = weatherEvents[weather] || weatherEvents.clear;
  return {
    color: [sunData.color[0] * weatherMod.sun, sunData.color[1] * weatherMod.sun, sunData.color[2] * weatherMod.sun],
    intensity: sunData.intensity * weatherMod.sun,
  };
};

export const getSunPosition = (t) => {
  const angle = t * Math.PI * 2;
  return {
    x: Math.cos(angle) * 25,
    y: Math.sin(angle) * 15 + 8,
    z: Math.sin(angle) * 25,
  };
};