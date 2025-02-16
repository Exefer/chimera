<script lang="ts" module>
  import * as Steam from "@/types/steam.types";
  import type { HTMLAttributes } from "svelte/elements";

  export type GameCardProps = HTMLAttributes<HTMLAnchorElement> & {
    game: Omit<Steam.App, "clientIcon">;
  };
</script>

<script lang="ts">
  import { constructGameUrl } from "@/helpers";
  import { steamImageBuilder } from "@/services/steam";
  import { cn } from "@/utils";

  let { class: className, game, ...restProps }: GameCardProps = $props();
</script>

<a
  class={cn(
    "group relative h-fit w-full overflow-hidden rounded-md border shadow-md",
    className
  )}
  href={constructGameUrl(game.id, game.name)}
  {...restProps}
>
  <img
    class="size-full object-cover transition-transform group-hover:scale-105"
    src={steamImageBuilder.library(game.id)}
    height="120"
    alt={game.name}
  />
  <div
    class="absolute top-0 flex size-full items-end p-4 shadow-[inset_0_-40px_60px_20px_rgba(0,0,0,0.95)]"
  >
    <p class="font-bold text-white">{game.name}</p>
  </div>
</a>
