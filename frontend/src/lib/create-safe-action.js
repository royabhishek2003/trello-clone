const createSafeAction = (schema, handler) => {
  return async (data) => {
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      return {
        fieldErrors: validationResult.error.flatten().fieldErrors
      };
    }
    return handler(validationResult.data);
  };
};
export {
  createSafeAction
};
