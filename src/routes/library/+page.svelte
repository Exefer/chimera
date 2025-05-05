<script lang="ts">
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { constructGameUrl } from "@/helpers";
  import { LibraryManager } from "@/services/library-manager";
  import { steamImageBuilder } from "@/services/steam";
  import { library } from "@/stores";
  import { formatSeconds } from "@/utils";
  import ClockIcon from "lucide-svelte/icons/clock";
  import PauseIcon from "lucide-svelte/icons/pause";
  import PlayIcon from "lucide-svelte/icons/play";
</script>

<!-- Proof of concept page -->
<main class="flex gap-4 p-4">
  <ul class="flex flex-wrap gap-4">
    {#each $library as game}
      <li class="group relative flex overflow-hidden rounded-md">
        <a href={constructGameUrl(game.objectId, game.title)}>
          <img
            class="relative transition-transform group-hover:scale-105"
            src={steamImageBuilder.cover(game.objectId)}
            alt={game.title}
            width="200"
          />
        </a>
        <Badge position="top-left">
          <ClockIcon size="12" />
          {formatSeconds(game.playtimeInSeconds)}
        </Badge>
        {#if game.executablePath}
          <Button
            variant="secondary"
            size="icon"
            class="absolute bottom-2 right-2"
            onclick={() => {
              if (game.running) {
                LibraryManager.closeGame(game.executablePath!);
              } else {
                LibraryManager.openGame(game.objectId);
              }
            }}
          >
            {#if game.running}
              <PauseIcon />
            {:else}
              <PlayIcon />
            {/if}
          </Button>
        {/if}
      </li>
    {/each}
  </ul>
</main>
