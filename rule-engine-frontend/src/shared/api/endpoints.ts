export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ApiEndpoint {
  SAVE_RULE = '/api/rules',
  EVALUATE_RULE = '/api/rules/evaluate',
  GET_ALL_RULES = '/api/rules',
  GET_RULE_BY_ID = '/api/rules/:id',
  DELETE_RULE = '/api/rules/:id',
  GET_ALL_FIELDS = '/api/fields',
  CREATE_FIELD = '/api/fields',
  DELETE_FIELD = '/api/fields/:id',
}
