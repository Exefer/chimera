<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Checkbox } from "@/components/ui/checkbox";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Separator } from "@/components/ui/separator";
  import { Downloader, DOWNLOADER_NAME } from "@/constants/";
  import { getGameDetailsContext } from "@/context";
  import type { PackEntry } from "@/database";
  import { LibraryManager } from "@/services/library-manager";
  import { settings } from "@/stores";
  import { getDownloaderForUrl } from "@/utils";
  import { open as openDialog } from "@tauri-apps/plugin-dialog";
  import { t } from "svelte-i18n";
  import CircleCheck from "lucide-svelte/icons/circle-check-big";
  import DownloadIcon from "lucide-svelte/icons/download";

  interface DownloadSettingsModalProps {
    open: boolean;
    selectedPack: PackEntry | null;
    onClose: () => void;
    onDownloadErrored: () => void;
    handleStartDownload: (
      pack: PackEntry,
      download: Downloader,
      downloadPath: string,
      automaticallyExtract: boolean
    ) => void;
  }

  let { open, selectedPack, handleStartDownload, onClose }: DownloadSettingsModalProps =
    $props();

  const gameDetailsContext = getGameDetailsContext();
  const { title, objectId, game } = $derived(gameDetailsContext);

  let selectedUri = $state<string | null>(null);
  let downloadPath = $state($settings.downloadsPath);
  let automaticallyExtract = $state($settings.extractFilesByDefault);

  $effect(() => {
    if (!selectedPack) return;

    // TODO: Only debug
    selectedUri = selectedPack!.uris.find(
      uri =>
        ![Downloader.Torrent, Downloader.RealDebrid].includes(getDownloaderForUrl(uri))
    )!;
  });
</script>

<Dialog.Root
  {open}
  onOpenChange={open => {
    if (!open) onClose();
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t("game.download_settings")}</Dialog.Title>
      <Dialog.Description>{$t("game.choose_pack_to_download")}</Dialog.Description>
    </Dialog.Header>
    <Separator />
    <div class="flex flex-col gap-4">
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">{$t("game.downloader")}</p>
        <div class="flex flex-row gap-2">
          {#if selectedPack}
            {#each selectedPack!.uris as uri}
              {@const downloader = getDownloaderForUrl(uri)}
              {#if downloader !== Downloader.Unknown}
                <Button
                  variant={selectedUri === uri ? "default" : "outline"}
                  class="flex-1"
                  disabled={[Downloader.Torrent, Downloader.RealDebrid].includes(
                    downloader
                  )}
                  onclick={() => (selectedUri = uri)}
                >
                  {#if selectedUri === uri}
                    <CircleCheck />
                  {/if}
                  {DOWNLOADER_NAME[downloader]}
                </Button>
              {/if}
            {/each}
          {/if}
        </div>
      </div>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">{$t("game.download_path")}</p>
        <div class="flex flex-row gap-2">
          <Input
            type="text"
            value={downloadPath}
            placeholder={$t("game.download_path")}
            readonly
          />
          <Button
            variant="outline"
            onclick={async () => {
              const selected = await openDialog({
                directory: true,
                multiple: false,
              });
              if (!selected) return;
              downloadPath = selected;
            }}>{$t("common.change")}</Button
          >
        </div>
        <p class="text-xs text-muted-foreground">
          {@html $t("game.change_default_download_path", {
            values: {
              settings: text =>
                `<a href="/settings" class="text-primary underline">${text}</a>`,
            },
          })}
        </p>
      </div>
      <Button
        disabled={!selectedUri || !downloadPath}
        onclick={async () => {
          if (!game) {
            LibraryManager.addGameToLibrary(objectId, title);
          }

          handleStartDownload(
            selectedPack!,
            getDownloaderForUrl(selectedUri!),
            downloadPath!,
            automaticallyExtract
          );
        }}><DownloadIcon />{$t("game.download_now")}</Button
      >
      <div class="flex items-center gap-2">
        <Checkbox bind:checked={automaticallyExtract} />
        <Label>{$t("game.automatically_extract_files")}</Label>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
