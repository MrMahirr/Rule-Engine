import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, replaceParams } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { FieldPayload, FieldResponse } from '../types/field.types';
import { fieldKeys } from './fieldQueryKeys';
import { ApiResponse } from '../../../shared/api/types';

export function useFieldsQuery() {
  return useQuery({
    queryKey: fieldKeys.lists(),
    queryFn: () =>
      apiClient.request<ApiResponse<FieldResponse[]>>({
        endpoint: ApiEndpoint.GET_ALL_FIELDS,
        method: HttpMethod.GET,
      }),
  });
}

export function useCreateFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FieldPayload) =>
      apiClient.request<ApiResponse<FieldResponse>>({
        endpoint: ApiEndpoint.CREATE_FIELD,
        method: HttpMethod.POST,
        data: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
}

export function useDeleteFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.request<ApiResponse<void>>({
        endpoint: replaceParams(ApiEndpoint.DELETE_FIELD, { id }),
        method: HttpMethod.DELETE,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
}
