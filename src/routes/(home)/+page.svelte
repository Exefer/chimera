<script lang="ts">
  import GameCard from "@/components/game-card.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { CatalogueCategory } from "@/constants";
  import { HydraApi } from "@/services/hydra";
  import * as Steam from "@/types/steam.types";
  import { onMount } from "svelte";
  import { t } from "svelte-i18n";
  import Hero from "./hero.svelte";

  let catalogue = $state<Record<CatalogueCategory, Omit<Steam.App, "clientIcon">[]>>({
    [CatalogueCategory.Hot]: [],
    [CatalogueCategory.Weekly]: [],
    [CatalogueCategory.Achievements]: [],
  });
  let currentCatalogueCategory = $state<CatalogueCategory>(CatalogueCategory.Hot);
  let featuredGame = $state<Omit<Steam.App, "clientIcon"> | null>(null);

  const getCatalogue = async (category: CatalogueCategory) => {
    currentCatalogueCategory = category;
    const fetchedCatalogue = await HydraApi.getCatalogue(currentCatalogueCategory);
    catalogue[currentCatalogueCategory] = fetchedCatalogue.map(item => ({
      name: item.title,
      id: item.objectId,
    }));
  };

  const nextFeaturedGame = () => {
    const currentIndex = catalogue[currentCatalogueCategory].findIndex(
      item => item.id === featuredGame?.id
    );
    featuredGame =
      catalogue[currentCatalogueCategory][
        (currentIndex + 1) % catalogue[currentCatalogueCategory].length
      ];
  };

  const AUTOPLAY_DELAY = 30 * 1000;
  onMount(() => {
    getCatalogue(currentCatalogueCategory);

    const interval = setInterval(nextFeaturedGame, AUTOPLAY_DELAY);

    return () => clearInterval(interval);
  });

  $effect(() => {
    featuredGame = catalogue[currentCatalogueCategory][0];
  });
</script>

<main class="flex h-[var(--content-height)] flex-col gap-4 overflow-scroll p-4">
  <section class="flex flex-col gap-4">
    <h2 class="text-2xl font-bold">{$t(`home.featured`)}</h2>
    {#if featuredGame}
      <Hero game={featuredGame} />
    {:else}
      <div class="h-72 w-full animate-pulse rounded-md border bg-muted shadow-md"></div>
    {/if}
  </section>
  <section class="flex flex-col gap-4">
    <ul class="flex gap-2">
      {#each Object.values(CatalogueCategory) as category}
        <li>
          <Button
            variant={currentCatalogueCategory === category ? "default" : "outline"}
            onclick={() => getCatalogue(category)}>{$t(`home.${category}`)}</Button
          >
        </li>
      {/each}
    </ul>
    <h2 class="text-2xl font-bold">{$t(`home.${currentCatalogueCategory}`)}</h2>
    <div class="grid w-full grid-cols-[repeat(auto-fill,_minmax(340px,_1fr))] gap-2">
      {#each catalogue[currentCatalogueCategory] as item}
        <GameCard class="h-44" game={item} />
      {:else}
        {#each { length: 12 }}
          <div class="h-44 w-full rounded-md bg-muted animate-pulse shadow"></div>
        {/each}
      {/each}
    </div>
  </section>
</main>
