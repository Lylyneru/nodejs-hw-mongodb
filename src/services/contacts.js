import ContactCollection from '../db/models/contact.js';
import { sortList } from '../constants/index.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = sortList[0],
  filters = {},
}) => {
  const skip = (page - 1) * perPage;

  const contactQuery = ContactCollection.find(filters);

  const items = await contactQuery
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const totalItems = await ContactCollection.countDocuments(filters);

  const paginationData = calcPaginationData({ page, perPage, totalItems });

  return {
    items,
    totalItems,
    ...paginationData,
  };
};

export const getContactById = (id, userId) =>
  ContactCollection.findOne({ _id: id, userId });
export const addContact = async (payload) => {
  const contact = await ContactCollection.create(payload);
  return contact;
};
export const updateContact = async (_id, userId, payload, options = {}) => {
  const { upsert } = options;
  const rawResult = await ContactCollection.findOneAndUpdate(
    { _id, userId },
    payload,
    {
      new: true,
      upsert,
      includeResultMetadata: true,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};
export const deleteContactById = (_id, userId) =>
  ContactCollection.findOneAndDelete({ _id, userId });
