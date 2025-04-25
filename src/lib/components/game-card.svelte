<script lang="ts" module>
  import * as Steam from "@/types/steam.types";
  import type { HTMLAttributes } from "svelte/elements";

  export type GameCardProps = HTMLAttributes<HTMLAnchorElement> & {
    game: Omit<Steam.App, "clientIcon">;
  };
</script>

<script lang="ts">
  import { constructGameUrl } from "@/helpers";
  import { usePacks } from "@/hooks/use-packs";
  import { steamImageBuilder } from "@/services/steam";
  import { cn } from "@/utils";
  import { t } from "svelte-i18n";
  import Badge from "./badge.svelte";

  let { class: className, game, ...restProps }: GameCardProps = $props();

  const { getPacksForRemoteId } = usePacks();
  const packs = getPacksForRemoteId(game.id);
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
    class="absolute top-0 flex size-full items-end pb-2 pl-4 shadow-[inset_0_-40px_60px_20px_rgba(0,0,0,0.95)]"
  >
    <div class="flex flex-col gap-1">
      <p class="font-bold text-white">{game.name}</p>
      <ul class="flex flex-wrap gap-1">
        {#await packs then packs}
          {@const packers = new Set(packs.map(pack => pack.packer))}
          {#each packers as packer}
            <li><Badge>{packer}</Badge></li>
          {:else}
            <li class="text-muted-foreground font-semibold text-sm">
              {$t("game.no_downloads")}
            </li>
          {/each}
        {/await}
      </ul>
    </div>
  </div>
</a>
