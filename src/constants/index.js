import path from 'node:path';
export const sortList = ['asc', 'desc'];

export const TEMPLATES_DIR = path.resolve('src', 'templates');
export const TEMP_UPLOAD_DIR = path.resolve('temp');
export const UPLOAD_FILE_DIR = path.resolve('upload');

export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};
