<script lang="ts">
  import { Badge } from "@/components/ui/badge";
  import * as DropdownMenu from "@/components/ui/dropdown-menu";
  import { DOWNLOADER_NAME } from "@/constants";
  import type { DownloadEntry } from "@/database";
  import { constructGameUrl } from "@/helpers";
  import { useDownload } from "@/hooks";
  import { steamImageBuilder } from "@/services/steam";
  import { formatBytes } from "@/utils";
  import { t } from "svelte-i18n";
  import CirclePlay from "lucide-svelte/icons/circle-play";
  import CircleX from "lucide-svelte/icons/circle-x";
  import MenuIcon from "lucide-svelte/icons/menu";
  import PauseIcon from "lucide-svelte/icons/pause";

  interface DownloadGroupProps {
    title: string;
    items: DownloadEntry[];
    openDeleteDownloadModal: (download: DownloadEntry) => void;
  }

  let { title, items, openDeleteDownloadModal }: DownloadGroupProps = $props();

  const { abortDownload, pauseDownload, resumeDownload } = useDownload();

  const getDownloadActions = (download: DownloadEntry) => {
    switch (download.status) {
      case "paused":
        return [
          {
            label: $t("downloads.resume"),
            onClick: () => resumeDownload(download.originalUrl),
            icon: CirclePlay,
          },
          {
            label: $t("downloads.abort"),
            onClick: () => abortDownload(download.url),
            icon: CircleX,
          },
        ];
      case "progress":
        return [
          {
            label: $t("downloads.pause"),
            onClick: () => pauseDownload(download.url),
            icon: PauseIcon,
          },
          {
            label: $t("downloads.abort"),
            onClick: () => abortDownload(download.url),
            icon: CircleX,
          },
        ];
      case "completed":
        return [
          /*           {
            label: $t("downloads.install"),
            onClick: () => toast.info($t("common.not_implemented")),
            icon: DownloadIcon,
          }, */
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
              src={steamImageBuilder.library(download.objectId)}
              alt={download.title}
              class="size-full rounded-l-md border-r object-fill"
            />
            <Badge position="bottom-right">{packer}</Badge>
          </div>
          <div class="flex w-2/3 flex-col justify-center gap-2 p-4">
            <a
              href={constructGameUrl(download.objectId, download.title)}
              class="text-lg font-medium hover:underline"
            >
              {download.title}
            </a>
            <div class="text-sm text-muted-foreground">
              {#if download.status === "progress"}
                <p>{download.progress?.toFixed(1)}%</p>
                <p>
                  {formatBytes(download.downloadedBytes!)} / {formatBytes(
                    download.fileSize
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
