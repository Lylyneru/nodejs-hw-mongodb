import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getContactsController,
  getContactByIdController,
  addContactController,
  patchContactController,
  deleteContactController,
} from '../controllers/contacts.js';

import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

import { validateBody } from '../utils/validateBody.js';

import { contactSchema, updateContactSchema } from '../validation/contacts.js';

const contactsRouter = Router();
contactsRouter.use(authenticate);
contactsRouter.get('/', ctrlWrapper(getContactsController));
contactsRouter.get('/:id', isValidId, ctrlWrapper(getContactByIdController));
contactsRouter.post(
  '/',
  validateBody(contactSchema),
  ctrlWrapper(addContactController),
);

contactsRouter.patch(
  '/:id',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);
contactsRouter.delete('/:id', isValidId, ctrlWrapper(deleteContactController));

export default contactsRouter;
