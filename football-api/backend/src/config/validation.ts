import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development','test','production').default('development'),
  DB_DIALECT: Joi.string().valid('postgres','mysql','mariadb','mssql','sqlite').required(),
  DB_HOST: Joi.when('DB_DIALECT', {
    is: Joi.valid('sqlite'),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  DB_PORT: Joi.when('DB_DIALECT', {
    is: Joi.valid('sqlite'),
    then: Joi.number().optional(),
    otherwise: Joi.number().required(),
  }),
  DB_NAME: Joi.when('DB_DIALECT', {
    is: Joi.valid('sqlite'),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  DB_USER: Joi.when('DB_DIALECT', {
    is: Joi.valid('sqlite'),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  DB_PASS: Joi.when('DB_DIALECT', {
    is: Joi.valid('sqlite'),
    then: Joi.string().optional(),
    otherwise: Joi.string().allow('').required(),
  }),
  DB_STORAGE: Joi.string().when('DB_DIALECT', {
    is: 'sqlite',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES: Joi.string().default('1d'),
});
