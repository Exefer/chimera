<script lang="ts">
  import { downloads } from "@/stores";
  import { formatBytes } from "@/utils";
  import { getCurrentWindow, ProgressBarStatus } from "@tauri-apps/api/window";
  import { t } from "svelte-i18n";
  import { formatDuration, intervalToDuration } from "date-fns";

  const [currentDownload] = $derived(
    $downloads
      .filter(download => download.status === "progress")
      .toSorted((a, b) => b.progress! - a.progress!)
  );

  const window = getCurrentWindow();

  $effect(() => {
    if (currentDownload && currentDownload.status === "progress") {
      window.setProgressBar({
        status: ProgressBarStatus.Normal,
        progress: Math.trunc(currentDownload.progress!),
      });
    } else {
      window.setProgressBar({
        status: ProgressBarStatus.None,
      });
    }
  });
</script>

<footer
  class="fixed bottom-0 z-50 flex w-full justify-between border-y bg-background px-4 py-1 text-xs text-muted-foreground shadow"
>
  <a href="/downloads" class="underline-offset-1 hover:underline">
    {#if currentDownload && currentDownload.status === "progress"}
      {#if currentDownload.eta}
        {$t("bottom_panel.downloading", {
          values: {
            title: currentDownload.title,
            percentage: currentDownload.progress?.toFixed(1),
            eta: formatDuration(
              intervalToDuration({
                start: 0,
                end: currentDownload.eta * 1000,
              }),
              { format: ["years", "months", "weeks", "days", "hours", "minutes"] }
            ),
            speed: formatBytes(currentDownload.downloadSpeed!),
          },
        })}
      {:else}
        {$t("bottom_panel.calculating_eta", {
          values: {
            title: currentDownload.title,
            percentage: currentDownload.progress?.toFixed(1),
          },
        })}
      {/if}
    {:else}
      {$t("bottom_panel.no_downloads_in_progress")}
    {/if}
  </a>

  <p>
    {$t("bottom_panel.app_version", {
      values: {
        version: __APP_VERSION__,
      },
    })}
  </p>
</footer>
