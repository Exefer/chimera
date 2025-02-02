<script lang="ts">
  import { steamImageBuilder } from "@/services/steam";
  import { games } from "@/stores";
  import { getGameDetailsUrl } from "@/utils";
</script>

<main class="p-4">
  <ul class="flex flex-row flex-wrap gap-4">
    {#each $games as game}
      <li class="transition-transform hover:scale-105">
        <a href={getGameDetailsUrl(game.remote_id, game.title)}>
          <img
            class="relative rounded-md"
            src={steamImageBuilder.cover(game.remote_id)}
            alt={game.title}
            width="200"
          />
        </a>
      </li>
    {/each}
  </ul>
</main>
