import createHttpError from 'http-errors';

import {
  getContacts,
  getContactById,
  addContact,
  updateContact,
  deleteContactById,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const data = await getContacts();

  res.json({
    status: 200,
    message: 'Successfully find contacts',
    data,
  });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;

  const data = await getContactById(id);

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: `Successfully find contact with id=${id}`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const data = await addContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully add contact',
    data,
  });
};
export const patchContactController = async (req, res) => {
  const { id } = req.params;
  const result = await updateContact(id, req.body);

  if (!result) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: 'Successfully update contact',
    data: result.data,
  });
};
export const deleteContactController = async (req, res) => {
  const { id } = req.params;
  const data = await deleteContactById(id);

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.status(204).send();
};
