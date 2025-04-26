<script lang="ts">
  import { t } from "svelte-i18n";
  import DownloadIcon from "lucide-svelte/icons/download";

  interface DownloadCompleteToastProps {
    title: string;
    iconUrl: string;
  }

  const { title, iconUrl }: DownloadCompleteToastProps = $props();
</script>

<div class="flex gap-2">
  <img src={iconUrl} alt="Game Icon" class="size-12" />
  <div class="w-full flex-col">
    <p class="flex items-center gap-1 text-xs text-muted-foreground">
      <DownloadIcon size="12" />
      <span>{$t("notifications.download_complete:title")}</span>
    </p>
    <p>{title}</p>
    <p class="text-xs text-muted-foreground">
      {$t("notifications.download_complete:description")}
    </p>
  </div>
</div>
