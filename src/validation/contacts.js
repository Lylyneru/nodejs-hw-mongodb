import Joi from 'joi';

import { typeList } from '../constants/contacts.js';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string()
    .pattern(/^\+380\d{9}$/)
    .required(),
  email: Joi.string().email().min(3).max(20).required(),
  isFavourite: Joi.boolean().required(),
  contactType: Joi.string()
    .valid(...typeList)
    .required(),
  photo: Joi.any().optional(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().pattern(/^\+380\d{9}$/),
  email: Joi.string().email().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...typeList),
  photo: Joi.any().optional(),
}).min(1); // 🔥 гарантує, що хоча б одне поле буде передано
