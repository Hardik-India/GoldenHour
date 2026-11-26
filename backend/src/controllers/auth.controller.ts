import { Response } from 'express';
import { User, IUser } from '../models/User';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { toPoint } from '../utils/geo';

const publicUser = (u: IUser) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  language: u.language,
  location: u.location,
  responderProfile: u.responderProfile,
  donorProfile: u.donorProfile,
});

const sendAuth = (res: Response, user: IUser, status = 200) =>
  res.status(status).json({
    success: true,
    token: signToken({ id: user.id, role: user.role }),
    user: publicUser(user),
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, language, asResponder, asDonor, bloodGroup, certifications } =
    req.body;

  if (await User.findOne({ email })) throw ApiError.conflict('Email already registered');
  if (asDonor && !bloodGroup) throw ApiError.badRequest('bloodGroup is required for donors');

  const user = new User({
    name,
    email,
    phone,
    password,
    language: language || 'en',
    role: asResponder ? 'responder' : 'citizen',
  });

  if (asResponder) {
    user.responderProfile = {
      isResponder: true,
      verified: false, // an admin must verify before alerts are sent
      available: false,
      certifications: certifications || [],
      appliedAt: new Date(),
      incidentsHandled: 0,
    };
  }
  if (asDonor) {
    user.donorProfile = {
      isDonor: true,
      bloodGroup,
      available: true,
      donationsCount: 0,
    };
  }

  await user.save();
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account disabled');
  sendAuth(res, user);
});

export const me = asyncHandler(async (req: AuthRequest, res) => {
  res.json({ success: true, user: publicUser(req.user!) });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res) => {
  const user = req.user!;
  const { name, phone, language, lat, lng, responderAvailable, donorAvailable } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (language) user.language = language;
  if (typeof lat === 'number' && typeof lng === 'number') {
    user.location = toPoint(lat, lng);
    user.locationUpdatedAt = new Date();
  }
  if (typeof responderAvailable === 'boolean') {
    if (!user.responderProfile.isResponder || !user.responderProfile.verified) {
      throw ApiError.forbidden('Only verified responders can change availability');
    }
    user.responderProfile.available = responderAvailable;
  }
  if (typeof donorAvailable === 'boolean') {
    if (!user.donorProfile.isDonor) throw ApiError.badRequest('Register as a donor first');
    user.donorProfile.available = donorAvailable;
  }

  await user.save();
  res.json({ success: true, user: publicUser(user) });
});

export const becomeDonor = asyncHandler(async (req: AuthRequest, res) => {
  const user = req.user!;
  user.donorProfile.isDonor = true;
  user.donorProfile.bloodGroup = req.body.bloodGroup;
  user.donorProfile.available = true;
  if (req.body.lastDonationAt) user.donorProfile.lastDonationAt = req.body.lastDonationAt;
  await user.save();
  res.json({ success: true, user: publicUser(user) });
});

export const becomeResponder = asyncHandler(async (req: AuthRequest, res) => {
  const user = req.user!;
  if (user.role === 'admin' || user.role === 'hospital') {
    throw ApiError.badRequest('This account type cannot become a responder');
  }
  user.role = 'responder';
  user.responderProfile.isResponder = true;
  user.responderProfile.certifications = req.body.certifications;
  user.responderProfile.appliedAt = new Date();
  await user.save();
  res.json({
    success: true,
    message: 'Application received. An admin will verify your profile before you receive alerts.',
    user: publicUser(user),
  });
});
