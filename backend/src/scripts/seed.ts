import mongoose from 'mongoose';
import { env } from '../config/env';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { Ambulance } from '../models/Ambulance';
import { FirstAidGuide } from '../models/FirstAidGuide';
import { Incident } from '../models/Incident';
import { BloodRequest } from '../models/BloodRequest';
import { Notification } from '../models/Notification';
import { toPoint } from '../utils/geo';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
import { guides } from './guides.data';
import { logger } from '../utils/logger';

const { demoCenterLat: LAT, demoCenterLng: LNG } = env;

/** Random point within ~radiusKm of the demo centre. */
const around = (radiusKm: number): [number, number] => {
  const r = (radiusKm / 111) * Math.sqrt(Math.random());
  const t = Math.random() * 2 * Math.PI;
  return [LAT + r * Math.cos(t), LNG + (r * Math.sin(t)) / Math.cos((LAT * Math.PI) / 180)];
};

const names = [
  'Aarav Sharma', 'Diya Patel', 'Rohan Das', 'Ananya Iyer', 'Kabir Singh', 'Meera Nair',
  'Arjun Reddy', 'Saanvi Gupta', 'Vihaan Mehta', 'Ishita Roy', 'Aditya Verma', 'Neha Joshi',
  'Rahul Khan', 'Priya Menon', 'Siddharth Bose', 'Tanvi Kulkarni',
];

async function seed() {
  await connectDB();
  logger.info('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Hospital.deleteMany({}),
    Ambulance.deleteMany({}),
    FirstAidGuide.deleteMany({}),
    Incident.deleteMany({}),
    BloodRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // First-aid guides
  await FirstAidGuide.insertMany(guides.map((g) => ({ ...g, locale: 'en', reviewedBy: 'PENDING MEDICAL REVIEW' })));

  // Hospitals
  const hospitalDefs = [
    { name: 'City Trauma Care Hospital', trauma: 'advanced', icu: true, blood: true },
    { name: 'Lifeline Multispeciality Hospital', trauma: 'advanced', icu: true, blood: true },
    { name: 'Sunrise Community Hospital', trauma: 'basic', icu: false, blood: true },
    { name: 'Green Valley Clinic', trauma: 'none', icu: false, blood: false },
    { name: 'Civil District Hospital', trauma: 'basic', icu: true, blood: true },
  ] as const;

  const hospitals = [];
  for (const [i, h] of hospitalDefs.entries()) {
    const [lat, lng] = around(8);
    const stock: Record<string, number> = {};
    BLOOD_GROUPS.forEach((g) => (stock[g] = g === 'HH' ? 0 : Math.floor(Math.random() * 12)));
    hospitals.push(
      await Hospital.create({
        name: h.name,
        address: `${10 + i} Main Road`,
        city: 'Demo City',
        phone: `+91 90000 0${1000 + i}`,
        location: toPoint(lat, lng),
        traumaLevel: h.trauma,
        hasICU: h.icu,
        hasBloodBank: h.blood,
        beds: { icu: h.icu ? 4 + i : 0, general: 20 + i * 5 },
        bloodStock: stock,
        bloodStockUpdatedAt: new Date(),
      })
    );
  }

  // Ambulances
  for (let i = 0; i < 6; i++) {
    const [lat, lng] = around(7);
    await Ambulance.create({
      vehicleNumber: `DL01AB${1000 + i}`,
      type: i % 3 === 0 ? 'ALS' : 'BLS',
      operator: i % 2 === 0 ? 'State 108 Service' : hospitals[i % hospitals.length].name,
      phone: `+91 98000 0${2000 + i}`,
      status: 'available',
      location: toPoint(lat, lng),
      hospital: hospitals[i % hospitals.length]._id,
    });
  }

  // Users
  await User.create({
    name: 'GoldenHour Admin',
    email: env.seedAdminEmail,
    phone: '+910000000000',
    password: env.seedAdminPassword,
    role: 'admin',
  });

  await User.create({
    name: 'Hospital Desk',
    email: 'hospital@goldenhour.app',
    phone: '+910000000001',
    password: 'Hospital@12345',
    role: 'hospital',
    hospital: hospitals[0]._id,
  });

  await User.create({
    name: 'Demo Citizen',
    email: 'citizen@goldenhour.app',
    phone: '+919999900000',
    password: 'Citizen@12345',
    role: 'citizen',
    location: toPoint(LAT, LNG),
  });

  // Responders (verified, available, within ~2.5 km of the centre so the SOS demo finds them)
  for (let i = 0; i < 8; i++) {
    const [lat, lng] = around(2.5);
    await User.create({
      name: names[i],
      email: `responder${i + 1}@goldenhour.app`,
      phone: `+91 97000 0${3000 + i}`,
      password: 'Responder@12345',
      role: 'responder',
      location: toPoint(lat, lng),
      locationUpdatedAt: new Date(),
      responderProfile: {
        isResponder: true,
        verified: true,
        available: true,
        certifications: i % 2 === 0 ? ['First Aid (Red Cross)', 'CPR/BLS'] : ['CPR/BLS'],
        incidentsHandled: 0,
      },
    });
  }

  // One unverified responder so the admin screen has something to approve
  await User.create({
    name: 'Pending Responder',
    email: 'pending@goldenhour.app',
    phone: '+919600000000',
    password: 'Responder@12345',
    role: 'responder',
    location: toPoint(...around(2)),
    responderProfile: {
      isResponder: true,
      verified: false,
      available: false,
      certifications: ['First Aid'],
      appliedAt: new Date(),
      incidentsHandled: 0,
    },
  });

  // Donors
  for (let i = 0; i < 16; i++) {
    const [lat, lng] = around(10);
    await User.create({
      name: names[i % names.length] + ' (Donor)',
      email: `donor${i + 1}@goldenhour.app`,
      phone: `+91 96000 0${4000 + i}`,
      password: 'Donor@12345',
      role: 'citizen',
      location: toPoint(lat, lng),
      locationUpdatedAt: new Date(),
      donorProfile: {
        isDonor: true,
        bloodGroup: BLOOD_GROUPS[i % (BLOOD_GROUPS.length - 1)], // skip rare HH except one below
        available: true,
        donationsCount: i % 4,
      },
    });
  }
  // One rare-group donor to demo the rare-donor flow
  await User.create({
    name: 'Rare Donor (HH)',
    email: 'rare@goldenhour.app',
    phone: '+919500000000',
    password: 'Donor@12345',
    role: 'citizen',
    location: toPoint(...around(12)),
    donorProfile: { isDonor: true, bloodGroup: 'HH', available: true, donationsCount: 2 },
  });

  logger.info('Seed complete. Demo logins:');
  logger.info(`  admin      ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  logger.info('  citizen    citizen@goldenhour.app / Citizen@12345');
  logger.info('  responder  responder1@goldenhour.app / Responder@12345');
  logger.info('  donor      donor1@goldenhour.app / Donor@12345');
  logger.info('  hospital   hospital@goldenhour.app / Hospital@12345');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  logger.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
