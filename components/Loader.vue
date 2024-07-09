<script setup></script>
<template>
  <transition>
    <div class="loader">
      <div class="logo__wrapper">
        <div class="logo">
          <img src="../assets/images/logo.svg" alt="logo" class="logo__img" />
        </div>
      </div>
    </div>
  </transition>
</template>
<style scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  height: 100vh;
  width: 100%;
  background: #212726;
}
.logo {
  position: relative;
  z-index: 3;
  display: inline-flex;
  padding: 12px 30px;
  border-radius: 36px;
  border: 5px solid #9dc16e;
  background: #212726;
  box-shadow: 0px 4px 0px 0px #394e1f;
  pointer-events: none;
  user-select: none;
  transition: 0.3s;
  cursor: pointer;
}

.logo__wrapper {
  text-align: center;
}

.logo__img {
  height: 100%;
  width: 115px;
  max-width: none;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  position: relative;
  z-index: 1;
}
@media only screen and (min-width: 2000px) {
  .logo {
    padding: 1vh 3vh;
    border-radius: 4vh;
    box-shadow: 0px 0.4vw 0px 0px #394e1f;
  }
  .logo__img {
    width: 6vw;
  }
}

.v-leave-active {
  transition: opacity 0.3s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
