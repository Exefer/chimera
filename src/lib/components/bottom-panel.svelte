<script lang="ts">
 import { BYTES_TO_MEGABYTES } from "@/constants";
 import { downloads } from "@/stores";
 import { formatDuration, intervalToDuration } from "date-fns";
</script>

<footer
 class="fixed bottom-0 z-50 w-full border-y bg-background px-4 py-1 text-xs text-muted-foreground shadow"
>
 <a class="underline-offset-1 hover:underline" href="/downloads">
  {#if $downloads[0] && $downloads[0].status == "progress"}
   {@const download = $downloads[0]}

   Downloading <b>{download.title}</b>...({download.progress?.toFixed(1)}%
   complete) - Completion in about {formatDuration(
    intervalToDuration({
     start: 0,
     end: (download.eta! || 1) * 1000,
    }),
    { format: ["minutes", "seconds", "hours", "days", "weeks"] },
   )} - {(download.download_speed! / BYTES_TO_MEGABYTES).toFixed(1)}MB/S
  {:else}
   No downloads in progress
  {/if}
 </a>
</footer>
