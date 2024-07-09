<template>
  <footer class="footer" ref="foo">
    <div class="container container--large">
      <div class="footer__inner">
        <a href="https://www.instagram.com" target="_blank" class="footer__link"
          >INSTA</a
        >
        <a href="https://www.instagram.com" target="_blank" class="footer__link"
          >098 715 60 40 (ТЕЛЕГРАМ)</a
        >
        <a
          href="https://www.google.com/intl/uk/gmail/about/"
          target="_blank"
          class="footer__link"
          >SLOOON@GMAIL.COM</a
        >
        <a href="/" target="_blank" class="footer__link">ПРО НАС</a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";

.footer {
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  @include mobile {
    flex-grow: initial;
  }

  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    padding: 30px 0;

    @include mobile {
      flex-direction: column;
      padding: 60px 0 30px;
    }
    @include large {
      gap: 2vh;
      padding: 3vh 0;
    }
  }

  &__link {
    @include font(30px, $ivory, 700, 1);
    cursor: pointer;
    transition: 0.2s ease-in-out;

    &:hover,
    &:active {
      color: $yellow;
    }

    @include tablet {
      font-size: 24px;
    }
    @include tablet {
      font-size: 20px;
    }
    @include mobile {
      font-size: 18px;
    }
    @include large {
      font-size: 1.4em;
    }
  }
}
</style>
