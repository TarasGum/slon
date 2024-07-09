import type { UseFetchOptions } from "nuxt/app";

export function useAPI<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {}
) {
  const token = useCookie("token");

  const payload = {
    ...options,
    $fetch: useNuxtApp().$api,
  };
  if (token.value && token.value.length > 0) {
    payload.headers = { Authorization: `Token ${token.value}` };
  }
  return useFetch(url, payload);
}
