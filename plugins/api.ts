export default defineNuxtPlugin(() => {
  const $api = $fetch.create({
    baseURL: "https://api.slooon.shop/api/",
  });
  // Expose to useNuxtApp().$api
  return {
    provide: {
      api: $api,
    },
  };
});
