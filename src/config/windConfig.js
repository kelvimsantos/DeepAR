// ============================================
// CONFIGURAÇÃO DO VENTO COM DEBUG
// ============================================

export let windConfig = {
  strength: 0.35,
  speed: 1.2,
  swayAmount: 0.65,
};

// Função para atualizar o vento
export const updateWindFromWeather = (weatherType, weatherWindStrength) => {
  const oldStrength = windConfig.strength;
  
  if (weatherWindStrength !== undefined) {
    windConfig.strength = weatherWindStrength;
    windConfig.speed = 0.8 + weatherWindStrength * 1.0;
    windConfig.swayAmount = 0.5 + weatherWindStrength * 0.4;
  }
  
  // DEBUG - mostra quando o vento muda
  if (oldStrength !== windConfig.strength) {
    console.log(`💨 VENTO MUDOU: ${weatherType} | Força: ${windConfig.strength.toFixed(2)} | Velocidade: ${windConfig.speed.toFixed(2)}`);
  }
};

export const getWindStrength = () => {
  const val = windConfig.strength;
  return val;
};

export const getWindSpeed = () => windConfig.speed;
export const getWindSway = () => windConfig.swayAmount;