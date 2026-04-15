<script lang="ts">
  type Props = {
    x?: number;
    y?: number;
    active?: boolean;
  };

  const chickenSize = 56;

  let { x = 0, y = 0, active = false }: Props = $props();
</script>

<foreignObject
  x={x}
  y={y}
  width={chickenSize}
  height={chickenSize}
  pointer-events="none"
>
  <div class:active class="chicken" xmlns="http://www.w3.org/1999/xhtml">🐔</div>
</foreignObject>

<style lang="postcss">
  .chicken {
    align-items: center;
    display: flex;
    filter: drop-shadow(0 2px 3px rgb(15 23 42 / 35%));
    background: rgb(255 255 255 / 88%);
    border: 2px solid rgb(251 191 36 / 90%);
    border-radius: 9999px;
    box-shadow: 0 8px 18px rgb(15 23 42 / 20%);
    font-size: 40px;
    height: 100%;
    justify-content: center;
    line-height: 1;
    width: 100%;
  }

  .active {
    animation: chicken-dance 260ms ease-in-out infinite alternate;
    transform-origin: center;
  }

  @keyframes chicken-dance {
    from {
      transform: translateY(0) rotate(-8deg) scale(1);
    }

    to {
      transform: translateY(-3px) rotate(8deg) scale(1.05);
    }
  }
</style>
