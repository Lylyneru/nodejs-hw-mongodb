import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { getEnvVar } from './utils/getEnvVar.js';
import { getContacts, getContactById } from './services/contacts.js';

const PORT = process.env.PORT || 3000;

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    const data = await getContacts();
    res.json({
      status: 200,
      message: 'Successfully find contactss',
      data,
    });
  });

  app.get('/contacts/:id', async (req, res) => {
    const { id } = req.params;

    const data = await getContactById(id);

    if (!data) {
      return res.status(404).json({
        status: 404,
        message: `Contact with id=${id} not found`,
      });
    }
    res.json({
      status: 200,
      message: `Successfully find contact with id=${id}`,
      data,
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      message: `${req.url} not found`,
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: err.message,
    });
  });

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
