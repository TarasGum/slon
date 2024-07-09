export default defineNuxtConfig({
  // devtools: { enabled: true },

  routeRules: {
    // Homepage pre-rendered at build time
    "/": { ssr: true },
    // Product page generated on demand, revalidates in background, cached for 1 hour (3600 seconds)
    "/product/**": { ssr: true },
    // Blog posts page generated on demand, revalidates in background, cached on CDN for 1 hour (3600 seconds)
    "/checkout": { ssr: false },
    "/cart": { ssr: false },
    "/admin/**": { ssr: false },
    "/login": { ssr: false },
  },
  app: {
    head: {
      title: "SLOOON                                                   ",
      htmlAttrs: {
        lang: "ua",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content:
            "Ласкаво просимо на SLON – ваш ідеальний інтернет-магазин чаю! SLON - це онлайн платформа, яка пропонує великий вибір вишуканих чаїв з усього світу. Наш магазин спеціалізується на якісних сортах чаю, які привезені безпосередньо від кращих плантацій.",
        },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [
        { rel: "canonical", href: "https://slooon.shop/" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Anonymous+Pro:wght@400;700&family=Gasoek+One&family=Ubuntu+Mono:wght@400;700&display=swap",
        },
      ],
    },
  },

  css: ["~/assets/scss/style.scss"],
  modules: [
    "@pinia/nuxt",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
