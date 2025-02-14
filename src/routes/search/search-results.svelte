<script lang="ts">
  import { constructGameUrl } from "@/helpers";
  import { steamImageBuilder } from "@/services/steam";
  import * as Steam from "@/types/steam.types";

  interface SearchResultsProps {
    results: Steam.App[];
  }

  let { results }: SearchResultsProps = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,_minmax(340px,_1fr))] gap-2 w-full">
  {#each results as item}
    <a
      class="group relative h-fit w-fit overflow-hidden rounded-md border"
      href={constructGameUrl(item.id, item.name)}
    >
      <img
        class="transition-transform group-hover:scale-105"
        src={steamImageBuilder.library(item.id)}
        height="120"
        alt={item.name}
      />
      <div
        class="absolute top-0 size-full shadow-[inset_0_-40px_60px_20px_rgba(0,0,0,0.95)]"
      >
        <p class="absolute bottom-4 left-4 font-bold">{item.name}</p>
      </div>
    </a>
  {/each}
</div>
