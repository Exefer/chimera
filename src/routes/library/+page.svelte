<script lang="ts">
  import Badge from "@/components/badge.svelte";
  import { constructGameUrl } from "@/helpers";
  import { steamImageBuilder } from "@/services/steam";
  import { games } from "@/stores";
  import { formatSeconds } from "@/utils";
  import Clock from "lucide-svelte/icons/clock";
</script>

<!-- Proof of concept page -->
<main class="flex gap-4 p-4">
  <ul class="flex flex-wrap gap-4">
    {#each $games as game}
      <li class="relative flex transition-transform hover:scale-105">
        <a href={constructGameUrl(game.remote_id, game.title)}>
          <img
            class="relative rounded-md"
            src={steamImageBuilder.cover(game.remote_id)}
            alt={game.title}
            width="200"
          />
        </a>
        <Badge position="top-left">
          <Clock size="12" />
          {formatSeconds(game.playtime_in_seconds)}
        </Badge>
      </li>
    {/each}
  </ul>
</main>
