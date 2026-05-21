const MAX_FREE_BOARDS = 5;

const ACTION = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};

const ENTITY_TYPE = {
  BOARD: 'BOARD',
  LIST: 'LIST',
  CARD: 'CARD'
};

module.exports = {
  MAX_FREE_BOARDS,
  ACTION,
  ENTITY_TYPE
};
