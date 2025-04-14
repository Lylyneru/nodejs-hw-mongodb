import { typeList } from '../../constants/contacts.js';

export const parseContactFilterParams = (query) => {
  const { type, isFavourite } = query;

  const filter = {};
  if (type) {
    if (typeList.includes(type)) {
      filter.contactType = type;
    } else {
      console.warn(
        `❗ Invalid contact type: "${type}". Allowed types: ${typeList.join(
          ', ',
        )}`,
      );
    }
  }

  if (type && typeList.includes(type)) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    // Приводимо значення до boolean
    if (isFavourite === 'true' || isFavourite === true) {
      filter.isFavourite = true;
    } else if (isFavourite === 'false' || isFavourite === false) {
      filter.isFavourite = false;
    }
    // Якщо передано щось інше — просто ігноруємо
  }

  return filter;
};
