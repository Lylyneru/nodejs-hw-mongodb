import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import jwt from 'jsonwebtoken';

import UserCollection from '../db/models/User.js';
import SessionCollection from '../db/models/Session.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} from '../constants/auth.js';

import { TEMPLATES_DIR } from '../constants/index.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = Date.now() + accessTokenLifeTime;
  const refreshTokenValidUnitl = Date.now() + refreshTokenLifeTime;

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUnitl,
  };
};

export const findSession = (query) => SessionCollection.findOne(query);

export const findUser = (query) => UserCollection.findOne(query);

const verifyEmailPath = path.join(TEMPLATES_DIR, 'verify-email.html');
const appDomain = getEnvVar('APP_DOMAIN');
const jwtSecret = getEnvVar('JWT_SECRET');

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });

  if (user) {
    throw createHttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hashPassword,
  });

  const token = jwt.sign({ email }, jwtSecret, {
    expiresIn: '24h',
  });

  const templateSource = await fs.readFile(verifyEmailPath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  const html = template({
    verifyLink: `${appDomain}/auth/verify?token=${token}`,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html,
  };

  await sendEmail(verifyEmail);

  return newUser;
};

export const verifyUser = (token) => {
  try {
    const { email } = jwt.verify(token, jwtSecret);
    return UserCollection.findOneAndUpdate({ email }, { verify: true });
  } catch (error) {
    throw createHttpError(401, error.message);
  }
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.findOneAndDelete({ userId: user._id });

  const session = createSession();

  return SessionCollection.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUser = async ({ refreshToken, sessionId }) => {
  const session = await findSession({ refreshToken, _id: sessionId });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUnitl < Date.now()) {
    await SessionCollection.findOneAndDelete({ _id: session._id });
    throw createHttpError(401, 'Session token expired');
  }

  await SessionCollection.findOneAndDelete({ _id: session._id });

  const newSession = createSession();

  return SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = (sessionId) =>
  SessionCollection.deleteOne({ _id: sessionId });

export const sendResetPasswordEmail = async (email) => {
  const user = await findUser({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, jwtSecret, {
    subject: user._id.toString(),
    expiresIn: '5m',
  });

  const resetPasswordPath = path.join(TEMPLATES_DIR, 'reset-password.html');
  const templateSource = await fs.readFile(resetPasswordPath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  const html = template({
    resetLink: `${appDomain}/reset-password?token=${token}`,
  });

  const emailOptions = {
    to: email,
    subject: 'Reset your password',
    html,
  };

  try {
    await sendEmail(emailOptions);
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPasswordService = async (token, newPassword) => {
  let payload;

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  // const user = await findUser({ email });
  const { email, sub } = payload;

  const user = await UserCollection.findOne({ _id: sub, email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await UserCollection.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  await SessionCollection.deleteMany({ userId: user._id });
};

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetToken}">here</a> to reset your password!</p>`,
  });
};
