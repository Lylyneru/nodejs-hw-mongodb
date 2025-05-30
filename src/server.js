import express from 'express';
import { logger } from './middlewares/logger.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { UPLOAD_FILE_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = process.env.PORT || 3000;

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  app.use(logger);

  app.use('/upload', express.static(UPLOAD_FILE_DIR));
  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);
  app.use('/api-docs', swaggerDocs());

  app.use(notFoundHandler);

  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
