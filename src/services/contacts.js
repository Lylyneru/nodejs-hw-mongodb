import ContactCollection from '../db/models/contact.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findOne({ _id: id });
