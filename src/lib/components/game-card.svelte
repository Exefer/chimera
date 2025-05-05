<script lang="ts" module>
  import type { SteamGame } from "@/types/steam.types";
  import type { HTMLAttributes } from "svelte/elements";

  export type GameCardProps = HTMLAttributes<HTMLAnchorElement> & {
    game: Omit<SteamGame, "clientIcon">;
  };
</script>

<script lang="ts">
  import { Badge } from "@/components/ui/badge";
  import { constructGameUrl } from "@/helpers";
  import { usePacks } from "@/hooks";
  import { steamImageBuilder } from "@/services/steam";
  import { cn } from "@/utils";
  import { t } from "svelte-i18n";

  let { class: className, game, ...restProps }: GameCardProps = $props();

  const { getPacksForObjectId } = usePacks();

  const packs = getPacksForObjectId(game.id);
  const packers = Array.from(new Set(packs.map(pack => pack.packer)));

  const firstThreePackers = packers.slice(0, 3);
  const remainingPackers = packers.length - firstThreePackers.length;
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
    class="absolute top-0 flex size-full items-end pb-2 pl-4 shadow-[inset_0_-35px_60px_15px_rgba(0,0,0,0.95)]"
  >
    <div class="flex flex-col gap-1">
      <p class="font-bold text-primary-foreground dark:text-primary/95">
        {game.name}
      </p>
      <ul class="flex flex-wrap gap-1">
        {#each firstThreePackers as packer}
          <li>
            <Badge>{packer}</Badge>
          </li>
        {:else}
          <li class="text-muted-foreground font-semibold text-sm">
            {$t("game.no_downloads")}
          </li>
        {/each}
        {#if remainingPackers > 0}
          <li>
            <Badge>+{remainingPackers}</Badge>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</a>
