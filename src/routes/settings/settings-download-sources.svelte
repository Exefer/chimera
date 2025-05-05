<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { downloadSourcesTable } from "@/database";
  import { deleteDownloadSource, syncDownloadSources } from "@/services/download-sources";
  import { dexieStore } from "@/utils";
  import { t } from "svelte-i18n";
  import { fade, slide } from "svelte/transition";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
  import AddDownloadSourceModal from "./add-download-source-modal.svelte";

  const downloadSources = dexieStore(() => downloadSourcesTable.toArray());
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
        await syncDownloadSources();
        setTimeout(() => {
          isRefreshing = false;
        }, 500);
      }}
      ><RefreshCcw class={isRefreshing ? "animate-spin" : ""} />{$t(
        "settings.sources.sync_sources"
      )}</Button
    >
    <AddDownloadSourceModal />
  </div>

  <ul class="space-y-4">
    {#each $downloadSources as downloadSource (downloadSource.id)}
      <li class="space-y-2 rounded-lg border p-4 shadow-sm" in:slide out:fade>
        <h1 class="text-lg font-bold">{downloadSource.name}</h1>
        <small
          >{$t("settings.sources.count_download_options", {
            values: { count: downloadSource.downloadCount },
          })}</small
        >
        <p class="text-sm text-muted-foreground">
          {$t("settings.sources.download_source_url")}
        </p>
        <div class="flex justify-between gap-4">
          <Input value={downloadSource.url} readonly />
          <Button
            variant="outline"
            disabled={isRefreshing}
            onclick={async () => {
              isRefreshing = true;
              await deleteDownloadSource(downloadSource.id);
              isRefreshing = false;
            }}><CircleMinus />{$t("settings.sources.remove")}</Button
          >
        </div>
      </li>
    {/each}
  </ul>
</div>
