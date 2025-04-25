<script lang="ts">
  import { Button } from "@ui/button";
  import { t } from "svelte-i18n";
  import Behavior from "./settings-behavior.svelte";
  import DownloadSources from "./settings-download-sources.svelte";
  import General from "./settings-general.svelte";

  const tabs = [
    {
      name: () => $t("settings.general:title"),
      component: General,
    },
    {
      name: () => $t("settings.behavior:title"),
      component: Behavior,
    },
    {
      name: () => $t("settings.sources:title"),
      component: DownloadSources,
    },
  ];

  let selected = $state(tabs[0]);
</script>

<main class="p-4">
  <div
    class="flex h-fit flex-col gap-4 rounded-lg border p-6 shadow-sm dark:bg-background"
  >
    <ul class="flex gap-2">
      {#each tabs as tab}
        <li>
          <Button
            variant={tab.name() === selected.name() ? "default" : "outline"}
            onclick={() => {
              selected = tab;
            }}>{tab.name()}</Button
          >
        </li>
      {/each}
    </ul>
    <selected.component />
  </div>
</main>
