<script lang="ts">
  type Props = {
    size?: number;
    dancing?: boolean;
  };

  let { size = 56, dancing = true }: Props = $props();
</script>

<div
  class="dancing-chicken"
  class:dancing
  style:width="{size}px"
  style:height="{size}px"
  aria-hidden="true"
  data-testid="dancing-chicken"
>
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="legs">
      <line
        class="leg leg-left"
        x1="26"
        y1="50"
        x2="22"
        y2="62"
        stroke="#f59e0b"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <line
        class="leg leg-right"
        x1="38"
        y1="50"
        x2="42"
        y2="62"
        stroke="#f59e0b"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <polyline
        points="18,62 22,62 24,60"
        fill="none"
        stroke="#f59e0b"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <polyline
        points="46,62 42,62 40,60"
        fill="none"
        stroke="#f59e0b"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <g class="body-group">
      <ellipse
        cx="32"
        cy="40"
        rx="16"
        ry="14"
        fill="#fef3c7"
        stroke="#1f2937"
        stroke-width="1.5"
      />
      <path
        class="wing"
        d="M 22 38 Q 18 42 22 48 Q 28 46 28 40 Z"
        fill="#fde68a"
        stroke="#1f2937"
        stroke-width="1.2"
      />
      <circle
        cx="32"
        cy="22"
        r="10"
        fill="#fef3c7"
        stroke="#1f2937"
        stroke-width="1.5"
      />
      <path
        class="comb"
        d="M 28 13 Q 30 8 32 13 Q 34 8 36 13 L 36 16 L 28 16 Z"
        fill="#ef4444"
        stroke="#1f2937"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
      <circle cx="29" cy="22" r="1.6" fill="#1f2937" />
      <circle cx="35" cy="22" r="1.6" fill="#1f2937" />
      <polygon
        points="38,24 44,26 38,28"
        fill="#f59e0b"
        stroke="#1f2937"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
      <path
        d="M 26 30 Q 30 32 32 30"
        fill="none"
        stroke="#ef4444"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </g>
  </svg>
</div>

<style lang="postcss">
  .dancing-chicken {
    @apply pointer-events-none inline-block;
  }

  .dancing-chicken svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .dancing .body-group {
    transform-origin: 32px 40px;
    animation: chicken-bob 0.5s ease-in-out infinite;
  }

  .dancing .wing {
    transform-origin: 24px 42px;
    animation: chicken-wing 0.25s ease-in-out infinite alternate;
  }

  .dancing .comb {
    transform-origin: 32px 16px;
    animation: chicken-comb 0.5s ease-in-out infinite;
  }

  .dancing .leg-left {
    transform-origin: 26px 50px;
    animation: chicken-leg-left 0.5s ease-in-out infinite;
  }

  .dancing .leg-right {
    transform-origin: 38px 50px;
    animation: chicken-leg-right 0.5s ease-in-out infinite;
  }

  @keyframes chicken-bob {
    0%,
    100% {
      transform: translateY(0) rotate(-3deg);
    }

    50% {
      transform: translateY(-3px) rotate(3deg);
    }
  }

  @keyframes chicken-wing {
    from {
      transform: rotate(-12deg);
    }

    to {
      transform: rotate(20deg);
    }
  }

  @keyframes chicken-comb {
    0%,
    100% {
      transform: rotate(-6deg);
    }

    50% {
      transform: rotate(6deg);
    }
  }

  @keyframes chicken-leg-left {
    0%,
    100% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(15deg);
    }
  }

  @keyframes chicken-leg-right {
    0%,
    100% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(-15deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dancing .body-group,
    .dancing .wing,
    .dancing .comb,
    .dancing .leg-left,
    .dancing .leg-right {
      animation: none;
    }
  }
</style>
