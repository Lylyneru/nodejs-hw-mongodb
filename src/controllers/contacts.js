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
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const getContactsController = async (req, res) => {
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

  const photo = req.file;
  let photoUrl;
  if (photo) {
    photoUrl = await saveFileToCloudinary(photo);
  }
  const updatePayload = {
    ...req.body,
  };
  if (photoUrl) {
    updatePayload.photo = photoUrl;
  }

  const data = await addContact({ ...updatePayload, userId });

  res.status(201).json({
    status: 201,
    message: 'Successfully add contact',
    data,
  });
};

export const patchContactController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const photo = req.file;
    let photoUrl;

    if (photo) {
      if (getEnvVar('SAVE_FILE_STRATEGY') === 'cloudinary') {
        photoUrl = await saveFileToCloudinary(photo);
      } else {
        photoUrl = await saveFileToUploadDir(photo);
      }
    }

    const data = await updateContact(id, userId, {
      ...req.body,
      photo: photoUrl,
    });

    if (!data) {
      throw createHttpError(404, `Contact with id=${id} not found`);
    }

    res.json({
      status: 200,
      message: 'Successfully update contact',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const data = await deleteContactById(id, userId);

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.status(204).send();
};
