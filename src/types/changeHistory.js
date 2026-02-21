/**
 * @typedef {'task' | 'objective' | 'key_result' | 'team' | 'organization'} EntityType
 */

/**
 * @typedef {'create' | 'update' | 'delete' | 'status_change' | 'assign'} ActionType
 */

/**
 * @typedef {Object} ChangeHistoryUser
 * @property {string} id
 * @property {string} full_name
 * @property {string} email
 */

/**
 * @typedef {Object} ChangeHistoryItem
 * @property {string} id
 * @property {EntityType} entity_type
 * @property {string} entity_id
 * @property {ActionType} action
 * @property {string|null} field_name
 * @property {any} old_value
 * @property {any} new_value
 * @property {ChangeHistoryUser} user
 * @property {string} created_at - ISO 8601 timestamp
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} total_pages
 */

/**
 * @typedef {Object} ChangeHistoryResponse
 * @property {ChangeHistoryItem[]} data
 * @property {PaginationMeta} pagination
 */

/**
 * @typedef {Object} ChangeHistoryFilters
 * @property {number} [page]
 * @property {number} [limit]
 * @property {ActionType} [action]
 * @property {string} [userId]
 * @property {string} [startDate] - ISO 8601
 * @property {string} [endDate] - ISO 8601
 * @property {EntityType} [entityType]
 */

export const EntityType = {
  TASK: 'task',
  OBJECTIVE: 'objective',
  KEY_RESULT: 'key_result',
  TEAM: 'team',
  ORGANIZATION: 'organization'
};

export const ActionType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  STATUS_CHANGE: 'status_change',
  ASSIGN: 'assign'
};
