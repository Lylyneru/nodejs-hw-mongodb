import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  authRegisterSchema,
  authLoginSchema,
  emailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import {
  registerController,
  verifyController,
  sendResetEmailController,
  loginController,
  refreshController,
  logoutController,
  resetPasswordController,
} from '../controllers/auth.js';
import { validateBody } from '../utils/validateBody.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(authRegisterSchema),
  ctrlWrapper(registerController),
);

authRouter.get('/verify', ctrlWrapper(verifyController));

authRouter.post(
  '/login',
  validateBody(authLoginSchema),
  ctrlWrapper(loginController),
);

authRouter.post('/refresh', ctrlWrapper(refreshController));

authRouter.post('/logout', ctrlWrapper(logoutController));

authRouter.post(
  '/send-reset-email',
  validateBody(emailSchema),
  ctrlWrapper(sendResetEmailController),
);

authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default authRouter;
