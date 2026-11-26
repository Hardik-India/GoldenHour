import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const num = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== '' ? n : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 8000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  responderRadiusKm: num(process.env.RESPONDER_RADIUS_KM, 3),
  donorRadiusKm: num(process.env.DONOR_RADIUS_KM, 15),
  ambulanceRadiusKm: num(process.env.AMBULANCE_RADIUS_KM, 15),
  hospitalRadiusKm: num(process.env.HOSPITAL_RADIUS_KM, 25),
  maxRespondersNotified: num(process.env.MAX_RESPONDERS_NOTIFIED, 15),
  donorCooldownDays: num(process.env.DONOR_COOLDOWN_DAYS, 90),
  avgUrbanSpeedKmph: num(process.env.AVG_URBAN_SPEED_KMPH, 25),
  demoCenterLat: num(process.env.DEMO_CENTER_LAT, 28.6139),
  demoCenterLng: num(process.env.DEMO_CENTER_LNG, 77.209),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@goldenhour.app',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  emergencyNumber: process.env.EMERGENCY_NUMBER || '112',
  ambulanceNumber: process.env.AMBULANCE_NUMBER || '108',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
};
