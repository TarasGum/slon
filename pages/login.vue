<script lang="ts" setup>
definePageMeta({
  layout: "admin",
});
import { useUserStore } from "~/stores/user";
import { toast, useToast } from "@/components/ui/toast/use-toast";

const userStore = useUserStore();
if (userStore.isLoggedIn) {
  navigateTo("/admin");
}
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
const token = useCookie("token");
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .nonempty({
        message: "Введіть пошту",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    password: z
      .string()
      .nonempty({
        message: "Введіть пароль",
      })
      .min(8, "малий пароль"),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/api-token-auth/`,
    {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
      onResponse: ({ response }) => {
        if (response._data.token) {
          token.value = response._data.token;
          userStore.loggedUserIn();

          navigateTo("/admin");
        } else {
          const error = Object.values(response._data).flatMap(
            (errorArray) => errorArray
          );
          toast({
            variant: "destructive",
            title: "Щось пішло не так:",
            description: error.join(","),
          });
          console.error("something wrong");
        }
      },
    }
  );
});
</script>
<template>
  <div class="pt-10">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="212"
      height="111"
      class="mx-auto mb-14"
      viewBox="0 0 212 111"
      fill="none">
      <g filter="url(#filter0_d_360_4148)">
        <rect
          x="18"
          y="28"
          width="175"
          height="55"
          rx="27.5"
          fill="#222B20"
          shape-rendering="crispEdges" />
        <rect
          x="15.4081"
          y="25.4081"
          width="180.184"
          height="60.1838"
          rx="30.0919"
          stroke="#9DC16E"
          stroke-width="5.18385"
          shape-rendering="crispEdges" />
        <path
          d="M73.4682 53.8365C72.0922 53.0119 70.6254 52.4064 69.0677 52.02C67.51 51.6077 65.6408 51.3243 63.4601 51.1697C63.2783 51.1439 63.0966 51.131 62.9149 51.131C62.7591 51.1052 62.6033 51.0924 62.4476 51.0924C61.9024 51.0924 61.6298 51.3114 61.6298 51.7494C61.6298 52.0071 61.7726 52.1874 62.0581 52.2905C62.3697 52.3678 62.7851 52.4322 63.3043 52.4837C64.3168 52.6126 65.3812 52.7672 66.4975 52.9475C67.6139 53.1021 68.7043 53.3469 69.7687 53.6819C70.8331 54.0168 71.7937 54.5064 72.6504 55.1505C73.5331 55.7947 74.2211 56.645 74.7144 57.7014C75.2336 58.7578 75.4932 60.0848 75.4932 61.6823C75.4932 63.4602 75.0778 64.9546 74.247 66.1656C73.4163 67.3509 72.287 68.3042 70.8591 69.0257C69.4572 69.7214 67.8475 70.2238 66.0302 70.533C64.2389 70.8422 62.3827 70.9968 60.4615 70.9968C58.2288 71.0225 56.0091 70.8937 53.8024 70.6103C51.6216 70.3526 49.6875 70.0177 48 69.6054L49.0904 56.0008C49.6875 56.4389 50.4014 56.9155 51.2322 57.4309C52.063 57.9204 53.1923 58.3713 54.6202 58.7836C56.0481 59.1958 57.9303 59.5179 60.2668 59.7498C60.3966 59.7756 60.5134 59.7885 60.6173 59.7885C60.7471 59.7885 60.8639 59.7885 60.9678 59.7885C61.2533 59.7885 61.461 59.7498 61.5908 59.6725C61.7466 59.5952 61.8245 59.4277 61.8245 59.1701C61.8245 58.8867 61.6947 58.7063 61.4351 58.629C61.2014 58.5517 60.825 58.4744 60.3057 58.3971C58.9038 58.2425 57.5019 58.0235 56.1 57.7401C54.724 57.4566 53.4649 57.0186 52.3226 56.426C51.1803 55.8334 50.2586 55.0088 49.5577 53.9524C48.8827 52.896 48.5452 51.5175 48.5452 49.8169C48.5452 47.3949 49.1163 45.4753 50.2586 44.0582C51.4269 42.6153 52.9976 41.5846 54.9707 40.9662C56.9437 40.3221 59.1505 40 61.5908 40C63.6418 40 65.7836 40.1932 68.0163 40.5797C70.249 40.9405 72.4557 41.4429 74.6365 42.0871L73.4682 53.8365Z"
          fill="#E6DDB9" />
        <path
          d="M89.844 40.6184V58.5517H101.76V70.9968H77.5772V40.6184H89.844Z"
          fill="#E6DDB9" />
        <path
          d="M132.219 62.3393C131.804 65.0448 130.363 67.1705 127.897 68.7165C125.43 70.2367 122.198 70.9968 118.2 70.9968C114.202 70.9968 110.97 70.2367 108.503 68.7165C106.063 67.1963 104.622 65.0963 104.181 62.4166C104.077 61.6952 103.986 60.7289 103.908 59.5179C103.856 58.2811 103.83 56.9542 103.83 55.537C103.83 54.1714 103.856 52.9089 103.908 51.7494C103.986 50.5642 104.077 49.6366 104.181 48.9666C104.622 46.1324 106.076 43.9294 108.542 42.3576C111.009 40.7859 114.228 40 118.2 40C122.198 40 125.43 40.7859 127.897 42.3576C130.363 43.9036 131.804 46.0551 132.219 48.8121C132.323 49.482 132.401 50.4096 132.453 51.5948C132.531 52.7543 132.57 54.0297 132.57 55.4211C132.57 56.8898 132.531 58.2296 132.453 59.4406C132.401 60.6516 132.323 61.6179 132.219 62.3393Z"
          fill="#E6DDB9" />
        <path
          d="M146.527 70.9968H134.962L134.961 40H148.63L157.598 62.3393L151.434 40H163L163 70.9968H150.383L140.701 46.7093L146.527 70.9968Z"
          fill="#E6DDB9" />
        <ellipse
          cx="7.75069"
          cy="7.78261"
          rx="7.75069"
          ry="7.78261"
          transform="matrix(-0.0141459 0.9999 -0.999902 -0.0140301 126.038 47.9683)"
          fill="#222B20" />
      </g>
      <rect
        x="149.406"
        y="0.579228"
        width="62"
        height="29"
        rx="14.5"
        transform="rotate(10 149.406 0.579228)"
        fill="#0A2015" />
      <rect
        x="149.406"
        y="0.579228"
        width="62"
        height="29"
        rx="14.5"
        transform="rotate(10 149.406 0.579228)"
        stroke="#63DA9D" />
      <path
        d="M162.742 21.7162L162.479 19.5109L159.571 18.9981L158.582 20.9826L157.121 20.725L161.41 12.4228L163.012 12.7053L164.203 21.9738L162.742 21.7162ZM160.158 17.8314L162.326 18.2137L161.887 14.4019L160.158 17.8314ZM172.384 18.8835C172.28 19.4714 172.118 20.0213 171.899 20.5333C171.684 21.0415 171.404 21.4734 171.059 21.8291C170.719 22.181 170.313 22.438 169.84 22.5999C169.372 22.7625 168.835 22.7905 168.229 22.6836L165.375 22.1803L166.924 13.395L169.778 13.8983C170.375 14.0035 170.865 14.2149 171.249 14.5324C171.638 14.8463 171.932 15.2267 172.131 15.6736C172.334 16.1213 172.452 16.621 172.484 17.1728C172.521 17.7253 172.487 18.2955 172.384 18.8835ZM170.99 18.6378C171.169 17.6235 171.133 16.8188 170.881 16.2238C170.631 15.6243 170.189 15.2687 169.556 15.1572L168.095 14.8996L166.989 21.1739L168.45 21.4315C169.083 21.5431 169.62 21.3555 170.062 20.8689C170.504 20.3823 170.814 19.6386 170.99 18.6378ZM178.516 24.4974L177.122 24.2517L178.17 18.3073L176.732 21.3091L175.655 21.1192L175.343 17.8087L174.295 23.7532L172.901 23.5074L174.45 14.7221L176.106 15.0141L176.55 19.1878L178.395 15.4177L180.065 15.7121L178.516 24.4974ZM185.362 25.7047L181.148 24.9616L181.369 23.7094L182.756 23.9539L183.862 17.6796L182.475 17.4351L182.697 16.1762L186.911 16.9193L186.689 18.1782L185.255 17.9254L184.149 24.1997L185.583 24.4525L185.362 25.7047ZM193.569 27.1517L191.953 26.8668L190.471 20.0389L189.348 26.4074L187.954 26.1617L189.503 17.3763L191.254 17.685L192.657 24.1727L193.724 18.1206L195.118 18.3663L193.569 27.1517Z"
        fill="#D4D4D4" />
      <defs>
        <filter
          id="filter0_d_360_4148"
          x="12.8162"
          y="22.8162"
          width="185.368"
          height="69.2807"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="3.91304" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.22446 0 0 0 0 0.304167 0 0 0 0 0.120399 0 0 0 1 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_360_4148" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_360_4148"
            result="shape" />
        </filter>
      </defs>
    </svg>
    <div
      class="border flex flex-col gap-[30px] rounded-[20px] p-10 mx-auto max-w-lg">
      <h1
        class="mx-auto text-center text-4xl text-[var(--White)] !leading-[70%]">
        ВХІД
      </h1>
      <p class="mx-auto text-sm text-[var(--Grey)] text-center">
        Будь ласка, введіть ваші дані у форму
      </p>
      <form @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormControl>
              <Input
                class="flex w-full placeholder:text-[var(--Grey-Dark)] p-[10px_10px_10px_20px] justify-between items-center rounded-lg border border-[#383838] bg-[#191919]"
                type="text"
                placeholder="ПОШТА"
                v-bind="componentField" />
            </FormControl>
            <FormMessage class="absolute -translate-y-[6px]" />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem class="mt-5">
            <FormControl>
              <Input
                class="flex w-full p-[10px_10px_10px_20px] placeholder:text-[var(--Grey-Dark)] justify-between items-center rounded-lg border border-[#383838] bg-[#191919]"
                type="password"
                placeholder="ПАРОЛЬ"
                v-bind="componentField" />
            </FormControl>
            <FormMessage class="absolute -translate-y-[6px]" />
          </FormItem>
        </FormField>

        <button
          class="flex h-10 p-[10px_14px] w-full mt-[30px] transition-all justify-center items-center gap-2.5 self-stretch rounded-full border border-[#63DA9D] bg-[#0A2015] shadow-[3px_4px_0px_0px_#17432C] hover:bg-[#182E23] hover:shadow-none cursor-pointer text-2xl">
          <h2>Увійти</h2>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
