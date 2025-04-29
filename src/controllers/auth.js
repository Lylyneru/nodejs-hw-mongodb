import {
  registerUser,
  verifyUser,
  loginUser,
  refreshUser,
  logoutUser,
  sendResetPasswordEmail,
  resetPasswordService,
} from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUnitl,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUnitl,
  });
};

export const registerController = async (req, res, next) => {
  const newUser = await registerUser(req.body);
  const userObject = newUser.toObject();
  delete userObject.password;

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: userObject,
  });
};

export const verifyController = async (req, res) => {
  await verifyUser(req.query.token);

  res.json({
    message: 'Email verified!',
  });
};

export const loginController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Login successfully',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshController = async (req, res) => {
  const session = await refreshUser(req.cookies);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Session successfullt refresh',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;
  await sendResetPasswordEmail(email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  await resetPasswordService(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
