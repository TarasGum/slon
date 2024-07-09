<template>
  <header class="header">
    <nuxt-link to="/">
      <div class="logo__wrapper">
        <div class="logo">
          <img
            src="@/assets/images/logo.svg"
            alt="SLON logo"
            class="logo__img" />
        </div></div
    ></nuxt-link>
  </header>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0 40px;
  background-color: $dark-2;

  @include large {
    margin: 3vh 0 4vh;
  }
}
.logo {
  position: relative;
  z-index: 3;
  display: inline-flex;
  padding: 12px 30px;
  border-radius: 36px;
  border: 5px solid $light-green;
  background: $dark-2;
  box-shadow: 0px 4px 0px 0px $dark-green;
  pointer-events: none;
  user-select: none;
  transition: 0.3s;
  cursor: pointer;

  @include large {
    padding: 1vh 3vh;
    border-radius: 4vh;
    box-shadow: 0px 0.4vw 0px 0px $dark-green;
  }

  &__wrapper {
    text-align: center;
  }

  &__img {
    height: 100%;
    width: 115px;
    max-width: none;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
    position: relative;
    z-index: 1;

    @include large {
      width: 6vw;
    }
  }
}
</style>
