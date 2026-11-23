/**
 * validate({ body, params, query }) — parses each part with its Zod schema and
 * replaces it with the parsed (coerced, stripped) value. ZodErrors go to errorHandler.
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req[key] = schemas[key].parse(req[key] ?? {});
    }
    next();
  } catch (err) {
    next(err);
  }
};
