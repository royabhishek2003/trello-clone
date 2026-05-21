const generateLogMessage = (log) => {
  const { action, entityTitle, entityType } = log;

  switch (action) {
    case 'CREATE':
      return `created ${entityType.toLowerCase()} "${entityTitle}"`;
    case 'UPDATE':
      return `updated ${entityType.toLowerCase()} "${entityTitle}"`;
    case 'DELETE':
      return `deleted ${entityType.toLowerCase()} "${entityTitle}"`;
    default:
      return `unknown action on ${entityType.toLowerCase()} "${entityTitle}"`;
  }
};

module.exports = { generateLogMessage };
