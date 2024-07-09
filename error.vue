<template>
  <div>
    <NuxtLayout name="error-layout">
      <div class="not-wrapper">
        <div class="container">
          <div class="not">
            <div class="not__title">404</div>

            <div class="not__subtitle">NO elephant?</div>
            <div class="not__btn">
              <div @click="handleClearError()" class="btn btn--green">
                повернутись на головну
              </div>
            </div>
          </div>
        </div>
      </div></NuxtLayout
    >
  </div>
</template>
<script setup>
const handleClearError = () => {
  clearError({ redirect: "/" });
};
const props = defineProps({
  error: { type: Object },
});
</script>
<style lang="scss" scoped>
@import "@/assets/scss/variables";

.not {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  min-height: 60vh;
  text-align: center;

  @include large {
    gap: 3vh;
  }

  &__title {
    font-family: "Gasoek One", sans-serif;
    @include font(200px, $ivory, 400, 1);
    letter-spacing: 8.96px;
    text-transform: uppercase;

    @include phablet {
      font-size: 100px;
    }
    @include large {
      font-size: 18em;
    }
  }
  &__subtitle {
    font-family: "Gasoek One", sans-serif;
    @include font(40px, $ivory, 400, 1);
    letter-spacing: 8.96px;
    text-transform: uppercase;

    @include phablet {
      font-size: 30px;
      letter-spacing: 1.5px;
    }
    @include large {
      font-size: 2em;
    }
  }

  &__btn {
    margin-top: 34px;

    @include large {
      margin-top: 4vh;
    }
  }
}
</style>
