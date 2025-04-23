import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseContactFilterParams } from '../utils/filters/parseContactFilterParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { contactSortFields } from '../db/models/contact.js';
import {
  getContacts,
  getContactById,
  addContact,
  updateContact,
  deleteContactById,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  console.log(req.query);

  const paginationParams = parsePaginationParams(req.query);
  const sortParams = parseSortParams(req.query, contactSortFields);
  const filters = parseContactFilterParams(req.query);
  filters.userId = req.user._id;
  const { items, totalItems, totalPages, hasPreviousPage, hasNextPage } =
    await getContacts({
      ...paginationParams,
      ...sortParams,
      filters,
    });

  res.json({
    status: 200,
    message: 'Successfully find contacts',
    data: {
      data: items,
      page: paginationParams.page,
      perPage: paginationParams.perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const data = await getContactById(id, userId);

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
  const { _id: userId } = req.user;
  const data = await addContact({ ...req.body, userId });

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
