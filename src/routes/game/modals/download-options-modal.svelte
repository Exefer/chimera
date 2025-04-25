<script lang="ts">
  import * as Dialog from "@ui/dialog";
  import { Input } from "@ui/input";
  import { Separator } from "@ui/separator";
  import Badge from "@/components/badge.svelte";
  import { getGameContext } from "@/context";
  import type { PackEntry } from "@/database";
  import { date, t } from "svelte-i18n";

  interface DownloadOptionsModalProps {
    open: boolean;
    onPackSelected: (pack: PackEntry) => void;
  }

  let { open = $bindable(false), onPackSelected }: DownloadOptionsModalProps = $props();
  const { packs, download } = getGameContext();
  let filter = $state("");
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t("game.download_options")}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <Input type="text" bind:value={filter} placeholder={$t("game.filter_packs")} />
    <div class="flex max-h-80 flex-col gap-2 overflow-y-scroll">
      {#if $packs}
        {#each $packs.filter(pack => {
          const lowercaseFilter = filter.toLowerCase();
          return pack.title.toLowerCase().includes(lowercaseFilter) || pack.packer
              .toLowerCase()
              .includes(lowercaseFilter);
        }) as pack}
          <button
            class="flex flex-col gap-2 rounded-md border bg-primary-foreground p-4 text-left hover:bg-primary-foreground/80 dark:border-none"
            onclick={() => onPackSelected(pack)}
          >
            <p class="text-wrap text-sm">{pack.title}</p>
            {#if download && pack.uris.find( uri => download!.original_url.startsWith(uri) )}
              <div>
                <Badge variant="transparent">{$t("game.last_downloaded_option")}</Badge>
              </div>
            {/if}
            <p class="text-xs text-muted-foreground">
              {pack.fileSize} - {pack.packer} - {$date(new Date(pack.uploadDate))}
            </p>
          </button>
        {/each}
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
