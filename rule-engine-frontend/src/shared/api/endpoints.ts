export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum ApiEndpoint {
  SAVE_RULE = '/api/rules',
  EVALUATE_RULE = '/api/rules/evaluate',
  EVALUATE_BATCH = '/api/rules/evaluate-batch',
  GET_ALL_RULES = '/api/rules',
  GET_RULE_BY_ID = '/api/rules/:id',
  GET_RULE_VERSIONS = '/api/rules/:id/versions',
  RESTORE_RULE_VERSION = '/api/rules/:id/restore/:versionId',
  DELETE_RULE = '/api/rules/:id',
  UPDATE_RULE = '/api/rules/:id',
  TOGGLE_RULE = '/api/rules/:id/toggle',
  GET_ALL_FIELDS = '/api/fields',
  CREATE_FIELD = '/api/fields',
  UPDATE_FIELD = '/api/fields/:id',
  DELETE_FIELD = '/api/fields/:id',
  GET_DASHBOARD_METRICS = '/api/metrics/dashboard',
  GET_AUDIT_LOGS = '/api/metrics/logs',
}
