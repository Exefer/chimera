<script lang="ts">
  import { constructGameUrl } from "@/helpers";
  import { getSteamAppDetails, steamImageBuilder } from "@/services/steam";
  import type { SteamGame } from "@/types/steam.types";

  interface HeroProps {
    game: Omit<SteamGame, "clientIcon">;
  }

  let { game }: HeroProps = $props();
  let description = $state<string | null>(null);

  $effect(() => {
    getSteamAppDetails(game.id).then(data => {
      description = data!.short_description;
    });
  });
</script>

<a
  class="group relative h-72 w-full overflow-hidden rounded-md border shadow-lg"
  href={constructGameUrl(game.id, game.name)}
>
  <img
    class="size-full object-cover object-center transition-transform group-hover:scale-105"
    src={steamImageBuilder.libraryHero(game.id)}
    alt={game.name}
  />
  <img
    class="absolute left-4 top-4 z-10 w-[300px]"
    src={steamImageBuilder.logo(game.id)}
    alt={game.name}
  />
  <div
    class="absolute top-0 flex size-full items-end pb-4 pl-4 shadow-[inset_0_-50px_100px_60px_rgba(0,0,0,0.95)]"
  >
    <p class="max-w-2xl text-sm text-white dark:text-muted-foreground">
      {@html description}
    </p>
  </div>
</a>
