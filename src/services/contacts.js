import ContactCollection from '../db/models/contact.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findOne({ _id: id });
export const addContact = (payload) => ContactCollection.create(payload);
export const updateContact = async (_id, payload, options = {}) => {
  const { upsert } = options;
  const rawResult = await ContactCollection.findOneAndUpdate({ _id }, payload, {
    new: true,
    upsert,
    includeResultMetadata: true,
  });

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};
export const deleteContactById = (_id) =>
  ContactCollection.findOneAndDelete({ _id });
