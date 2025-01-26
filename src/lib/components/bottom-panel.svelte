<script lang="ts">
 import { BYTES_TO_MEGABYTES } from "@/constants/";
 import { downloads } from "@/stores";
 import { formatDuration, intervalToDuration } from "date-fns";

 const downloadsCount = $derived($downloads.length);
 const currentDownload = $derived($downloads[downloadsCount - 1]);
</script>

<footer
 class="fixed bottom-0 z-50 flex w-full justify-between border-y bg-background px-4 py-1 text-xs text-muted-foreground shadow"
>
 <a class="underline-offset-1 hover:underline" href="/downloads">
  {#if currentDownload && currentDownload.status == "progress"}
   Downloading <b>{currentDownload.title}</b
   >...({currentDownload.progress_percentage?.toFixed(1)}% complete) -
   {#if currentDownload.eta}
    Completion in about {formatDuration(
     intervalToDuration({
      start: 0,
      end: currentDownload.eta * 1000,
     }),
     { format: ["minutes", "seconds", "hours", "days", "weeks"] },
    )} - {(currentDownload.download_speed! / BYTES_TO_MEGABYTES).toFixed(1)}MB/S
   {:else}
    Calculating ETA...
   {/if}
  {:else}
   No downloads in progress
  {/if}
 </a>

 <p>Version: {__APP_VERSION__}</p>
</footer>
