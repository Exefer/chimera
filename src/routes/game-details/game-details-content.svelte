<script lang="ts">
  import { getGameDetailsContext } from "@/context";
  import { steamImageBuilder } from "@/services/steam";
  import { t } from "svelte-i18n";
  import HeroPanel from "./hero-panel.svelte";
  import SidePanel from "./side-panel.svelte";

  const gameDetailsContext = getGameDetailsContext();
  const { title, objectId, details, hasNSFWContentBlocked } =
    $derived(gameDetailsContext);
</script>

<div class={[hasNSFWContentBlocked && "blur-lg"]}>
  <div class="relative">
    <img
      src={steamImageBuilder.libraryHero(objectId)}
      alt={title}
      class="max-h-[300px] min-h-[300px] min-w-full object-cover xl:max-h-[350px]"
      fetchpriority="high"
    />
    <div class="absolute bottom-4 left-4">
      <img
        src={steamImageBuilder.logo(objectId)}
        alt={title}
        fetchpriority="high"
        class="w-[300px]"
      />
    </div>
  </div>

  <HeroPanel />
  <div class="flex flex-row">
    <div class="flex w-full flex-col">
      <div class="border-b border-r p-4 text-sm">
        <p>
          {$t("game.released_on", {
            values: { date: details?.release_date.date },
          })}
        </p>
        <p>
          {$t("game.published_by", {
            values: { publisher: details?.publishers.join(", ") },
          })}
        </p>
      </div>
      <div>
        <div class="border-r p-4">
          <div class="flex xl:justify-center">
            <article class="pb-[34px] xl:max-w-[750px]">
              {@html details?.about_the_game}
            </article>
          </div>
        </div>
      </div>
    </div>
    <SidePanel />
  </div>
</div>

<style>
  :global(article ul) {
    list-style: disc;
    padding-left: 32px;
    padding-top: 8px;
  }

  :global(article img) {
    border-radius: 4px;
    min-width: 100%;
    margin-top: 8px;
  }

  :global(article h2) {
    font-size: 22px;
    font-weight: 800;
    margin: 16px 0 0;
  }

  :global(article p:not(:first-child)) {
    margin: 8px 0;
  }
</style>
