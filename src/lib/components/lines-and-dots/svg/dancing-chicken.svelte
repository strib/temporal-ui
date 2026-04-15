<script lang="ts">
  type Props = {
    x?: number;
    y?: number;
    active?: boolean;
  };

  let { x = 0, y = 0, active = false }: Props = $props();
</script>

<g transform={`translate(${x} ${y})`} pointer-events="none">
  <g class:active>
    <ellipse
      class="body"
      cx="0"
      cy="0"
      rx="13"
      ry="10"
      fill="#fff7d6"
      stroke="#111827"
      stroke-width="1.5"
    />
    <ellipse
      class="wing"
      cx="-3"
      cy="0"
      rx="5"
      ry="4"
      fill="#fde68a"
      stroke="#111827"
      stroke-width="1.5"
    />
    <circle
      class="head"
      cx="10"
      cy="-8"
      r="6"
      fill="#fff7d6"
      stroke="#111827"
      stroke-width="1.5"
    />
    <polygon
      points="15,-9 22,-6 15,-3"
      fill="#f59e0b"
      stroke="#111827"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="-9" r="1" fill="#111827" />
    <path
      d="M 7 -13 L 9 -18 L 11 -13"
      fill="#ef4444"
      stroke="#111827"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M -13 -2 L -18 -8 L -17 1 Z"
      fill="#fff7d6"
      stroke="#111827"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <line
      class="leg-left"
      x1="-3"
      y1="9"
      x2="-4"
      y2="17"
      stroke="#f59e0b"
      stroke-width="2"
      stroke-linecap="round"
    />
    <line
      class="leg-right"
      x1="3"
      y1="9"
      x2="4"
      y2="17"
      stroke="#f59e0b"
      stroke-width="2"
      stroke-linecap="round"
    />
  </g>
</g>

<style lang="postcss">
  .active {
    animation: chicken-bounce 280ms ease-in-out infinite alternate;
    transform-box: fill-box;
    transform-origin: center;
  }

  .active .head {
    animation: chicken-head 180ms ease-in-out infinite alternate;
    transform-box: fill-box;
    transform-origin: center;
  }

  .active .wing {
    animation: chicken-wing 160ms ease-in-out infinite alternate;
    transform-box: fill-box;
    transform-origin: center;
  }

  .active .leg-left,
  .active .leg-right {
    animation: chicken-step 140ms ease-in-out infinite alternate;
    transform-box: fill-box;
    transform-origin: top center;
  }

  .active .leg-right {
    animation-direction: alternate-reverse;
  }

  @keyframes chicken-bounce {
    from {
      transform: translateY(0) rotate(-4deg);
    }

    to {
      transform: translateY(-3px) rotate(4deg);
    }
  }

  @keyframes chicken-head {
    from {
      transform: rotate(-10deg) translateY(0);
    }

    to {
      transform: rotate(8deg) translateY(-1px);
    }
  }

  @keyframes chicken-wing {
    from {
      transform: rotate(-10deg);
    }

    to {
      transform: rotate(14deg);
    }
  }

  @keyframes chicken-step {
    from {
      transform: rotate(14deg);
    }

    to {
      transform: rotate(-12deg);
    }
  }
</style>
