<script lang="ts">
  import GameCard from "@/components/game-card.svelte";
  import type { SteamGame } from "@/types/steam.types";

  interface SearchResultsProps {
    results: SteamGame[];
  }

  let { results }: SearchResultsProps = $props();
</script>

<div class="grid w-full grid-cols-[repeat(auto-fill,_minmax(340px,_1fr))] gap-2">
  {#each results as item}
    <GameCard game={item} />
  {/each}
</div>
