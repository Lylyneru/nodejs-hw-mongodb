import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getContactsController,
  getContactByIdController,
  addContactController,
  patchContactController,
  deleteContactController,
} from '../controllers/contacts.js';

const contactsRouter = Router();
contactsRouter.get('/', ctrlWrapper(getContactsController));
contactsRouter.get('/:id', ctrlWrapper(getContactByIdController));
contactsRouter.post('/', ctrlWrapper(addContactController));
contactsRouter.patch('/:id', ctrlWrapper(patchContactController));
contactsRouter.delete('/:id', ctrlWrapper(deleteContactController));

export default contactsRouter;
