export const getMessageError = (data: unknown): string => {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') return data.message;
  return 'failed request';
};
