<script lang="ts">
  import { Button } from "@ui/button";
  import { Input } from "@ui/input";
  import { downloadSourcesTable } from "@/database";
  import { deleteDownloadSource } from "@/services/sources";
  import { t } from "svelte-i18n";
  import { fade, slide } from "svelte/transition";
  import { liveQuery } from "dexie";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
  import AddDownloadSourceModal from "./add-download-source-modal.svelte";

  const downloadSources = liveQuery(() => downloadSourcesTable.toArray());

  let isRefreshing = $state(false);
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">{$t("settings.sources:title")}</h1>

  <p>{$t("settings.sources:description")}</p>

  <div class="flex justify-between">
    <Button
      variant="outline"
      disabled={($downloadSources && $downloadSources.length === 0) || isRefreshing}
      onclick={async () => {
        isRefreshing = true;
        // Should refresh
        isRefreshing = false;
      }}
      ><RefreshCcw class={isRefreshing ? "animate-spin" : ""} />{$t(
        "settings.sources.sync_sources"
      )}</Button
    >
    <AddDownloadSourceModal
      hasDownloadSourceUrl={url => !!$downloadSources.find(entry => entry.url === url)}
    />
  </div>

  <ul class="space-y-4">
    {#each $downloadSources as source (source.id)}
      <li class="space-y-2 rounded-lg border p-4 shadow-sm" out:fade in:slide>
        <h1 class="text-lg font-bold">{source.name}</h1>
        <small
          >{$t("settings.sources.count_download_options", {
            values: { count: source.downloadCount },
          })}</small
        >
        <p class="text-sm text-muted-foreground">
          {$t("settings.sources.download_source_url")}
        </p>
        <div class="flex justify-between gap-4">
          <Input value={source.url} readonly />
          <Button
            variant="outline"
            onclick={() => {
              deleteDownloadSource(source.id);
            }}><CircleMinus />{$t("settings.sources.remove")}</Button
          >
        </div>
      </li>
    {/each}
  </ul>
</div>
