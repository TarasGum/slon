<template>
  <button
    :class="[
      'flex items-center justify-center rounded-full transition-all',
      sizeClasses,
      disabledClasses,
    ]"
    :style="buttonStyles"
    :disabled="disabled"
    @mouseover="hover = true"
    @mouseleave="(hover = false), (active = false)"
    @mousedown="active = true"
    @mouseup="active = false">
    <div
      :class="['flex items-center justify-center']"
      :style="iconContainerStyles">
      <div v-if="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18">
          <path
            d="M9 17.3333C4.39763 17.3333 0.666672 13.6023 0.666672 8.99996C0.666672 4.39758 4.39763 0.666626 9 0.666626C13.6023 0.666626 17.3333 4.39758 17.3333 8.99996C17.3333 13.6023 13.6023 17.3333 9 17.3333ZM8.16667 8.16663H4.83334V9.83329H8.16667V13.1666H9.83334V9.83329H13.1667V8.16663H9.83334V4.83329H8.16667V8.16663Z"
            :fill="disabled ? 'var(--Grey, #9B9B9B)' : `var(${color})`" />
        </svg>
      </div>
      <slot v-if="!iconOnly" class="leading-[0px]"></slot>
    </div>
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md"].includes(value),
  },
  color: {
    type: String,
    default: "",
  },
  iconPosition: {
    type: String,
    default: "left",
    validator: (value) => ["left", "right"].includes(value),
  },
  icon: Boolean,
  iconOnly: Boolean,
  disabled: Boolean,
  noShadow: Boolean,
});

const hover = ref(false);
const active = ref(false);
const computedColor = ref("");

onMounted(() => {
  computedColor.value = getComputedColor(props.color || "--Grey");
});

const sizeClasses = computed(() => {
  return props.size === "sm"
    ? "px-2.5 py-[6px] gap-1 text-sm leading-[100%]"
    : "px-[14px] py-2.5 gap-2 text-[18px] leading-[100%]";
});

const disabledClasses = computed(() => {
  return props.disabled
    ? "border-[var(--Grey)] bg-[var(--Black-Light)] shadow-none cursor-not-allowed pointer-events-none"
    : "";
});

const buttonStyles = computed(() => {
  if (props.disabled) {
    return {
      borderRadius: "80px",
      border: "1px solid var(--Grey, #9B9B9B)",
      background: "var(--Black-Light, #2C2C2C)",
      boxShadow: "3px 4px 0px 0px rgba(155, 155, 155, 0.20)",
      pointerEvents: "none",
    };
  }

  const backgroundColor = props.color
    ? hover.value && !active.value
      ? hexToRGBA(computedColor.value, 0.15)
      : darkenColor(computedColor.value)
    : hover.value && !active.value
    ? "rgba(25, 25, 25, 0.15)"
    : "#191919";

  return {
    borderColor: `var(${props.color})`,
    borderWidth: "1px",
    borderStyle: "solid",
    boxShadow: props.noShadow
      ? ""
      : hover.value
      ? ""
      : `3px 4px 0px 0px ${hexToRGBA(computedColor.value, 0.5)}`,
    borderRadius: "80px",
    backgroundColor,
    outline: active.value
      ? `2px solid ${hexToRGBA(computedColor.value, 0.5)}`
      : "",
  };
});

const iconContainerStyles = computed(() => {
  return {
    order: props.iconPosition === "left" ? "1" : "2",
    gap: props.size === "sm" ? "6px" : "10px",
  };
});

function hexToRGBA(hex, alpha) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

function darkenColor(hex) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, r - 220);
  g = Math.max(0, g - 220);
  b = Math.max(0, b - 220);

  return `rgba(${r},${g},${b})`;
}

function getComputedColor(variable) {
  const tempElement = document.createElement("div");
  tempElement.style.display = "none";
  tempElement.style.color = `var(${variable})`;
  document.body.appendChild(tempElement);
  const computedColor = getComputedStyle(tempElement).color;
  document.body.removeChild(tempElement);

  const rgb = computedColor.match(/\d+/g).map(Number);
  return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2])
    .toString(16)
    .slice(1)}`;
}
</script>

<style scoped>
button {
  text-transform: uppercase;
}
</style>
