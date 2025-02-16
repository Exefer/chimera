<script lang="ts">
  import * as DropdownMenu from "@ui/dropdown-menu";
  import Badge from "@/components/badge.svelte";
  import { DOWNLOADER_NAME } from "@/constants";
  import { constructGameUrl } from "@/helpers";
  import { steamImageBuilder } from "@/services/steam";
  import { downloads } from "@/stores";
  import * as Types from "@/types";
  import { formatBytes } from "@/utils";
  import { t } from "svelte-i18n";
  import { toast } from "svelte-sonner";
  import CirclePlay from "lucide-svelte/icons/circle-play";
  import CircleX from "lucide-svelte/icons/circle-x";
  import DownloadIcon from "lucide-svelte/icons/download";
  import MenuIcon from "lucide-svelte/icons/menu";
  import PauseIcon from "lucide-svelte/icons/pause";

  interface DownloadGroupProps {
    title: string;
    items: Types.Download[];
    openDeleteDownloadModal: (download: Types.Download) => void;
  }

  let { title, items, openDeleteDownloadModal }: DownloadGroupProps = $props();

  const getDownloadActions = (download: Types.Download) => {
    switch (download.status) {
      case "paused":
        return [
          {
            label: $t("downloads.resume"),
            onClick: () => downloads.resumeDownload(download.url),
            icon: CirclePlay,
          },
          {
            label: $t("downloads.abort"),
            onClick: () => downloads.abortDownload(download.url),
            icon: CircleX,
          },
        ];
      case "progress":
        return [
          {
            label: $t("downloads.pause"),
            onClick: () => downloads.pauseDownload(download.url),
            icon: PauseIcon,
          },
          {
            label: $t("downloads.abort"),
            onClick: () => downloads.abortDownload(download.url),
            icon: CircleX,
          },
        ];
      case "completed":
        return [
          {
            label: $t("downloads.install"),
            onClick: () => toast.info($t("common.not_implemented")),
            icon: DownloadIcon,
          },
          {
            label: $t("downloads.remove_installer"),
            onClick: () => openDeleteDownloadModal(download),
            icon: CircleX,
          },
        ];
      default:
        return [];
    }
  };
</script>

{#if items.length > 0}
  <section>
    <div
      class="mb-4 flex flex-row items-center justify-between gap-4 text-muted-foreground"
    >
      <h2 class="text-2xl font-bold">{title}</h2>
      <hr class="h-[1px] flex-1 bg-border" />
      <span class="text-lg font-semibold">
        {items.length}
      </span>
    </div>
    <ul class="flex flex-col gap-2">
      {#each items as download (download.url)}
        {@const packer = DOWNLOADER_NAME[download.downloader]}
        <li class="relative flex h-40 flex-row rounded-md border">
          <div class="relative w-[300px]">
            <img
              src={steamImageBuilder.library(download.remote_id)}
              alt={download.title}
              class="size-full rounded-l-md border-r object-fill"
            />
            <Badge position="bottom-right">{packer}</Badge>
          </div>
          <div class="flex w-2/3 flex-col justify-center gap-2 p-4">
            <a
              href={constructGameUrl(download.remote_id, download.title)}
              class="text-lg font-medium hover:underline"
            >
              {download.title}
            </a>
            <div class="text-sm text-muted-foreground">
              {#if download.status === "progress"}
                <p>{download.progress_percentage?.toFixed(1)}%</p>
                <p>
                  {formatBytes(download.downloaded_bytes!)} / {formatBytes(
                    download.content_length
                  )}
                </p>
              {:else if download.status === "paused"}
                <p>{$t("downloads.paused")}</p>
              {:else if download.status === "completed"}
                <p>{$t("downloads.completed")}</p>
              {/if}
            </div>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-muted disabled:text-muted-foreground"
              ><MenuIcon /></DropdownMenu.Trigger
            >
            <DropdownMenu.Content side="bottom" align="end">
              {#each getDownloadActions(download) as action}
                <DropdownMenu.Item onclick={action.onClick}>
                  <action.icon />
                  {action.label}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </li>
      {/each}
    </ul>
  </section>
{/if}
