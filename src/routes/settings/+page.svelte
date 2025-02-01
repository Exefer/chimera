<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { t } from "svelte-i18n";
  import Behavior from "./behavior.svelte";
  import General from "./general.svelte";
  import Sources from "./sources.svelte";

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
      component: Sources,
    },
  ];

  let selected = $state(tabs[0]);
</script>

<main class="p-4">
  <div
    class="flex h-fit flex-col gap-4 rounded-lg border p-6 shadow-sm dark:bg-background"
  >
    <div class="flex gap-2">
      {#each tabs as tab}
        <Button
          variant={tab.name() == selected.name() ? "default" : "outline"}
          onclick={() => {
            selected = tab;
          }}>{tab.name()}</Button
        >
      {/each}
    </div>
    <selected.component />
  </div>
</main>
