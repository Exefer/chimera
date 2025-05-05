<script lang="ts">
  import { Badge } from "@/components/ui/badge";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import type { PackEntry } from "@/database";
  import { date, t } from "svelte-i18n";

  interface DownloadOptionsModalProps {
    open: boolean;
    onPackSelected: (pack: PackEntry) => void;
  }

  let { open = $bindable(false), onPackSelected }: DownloadOptionsModalProps = $props();

  const gameDetailsContext = getGameDetailsContext();
  const { packs, download } = $derived(gameDetailsContext);

  let filter = $state("");
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t("game.download_options")}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <Input type="text" bind:value={filter} placeholder={$t("game.filter_packs")} />
    <div class="flex h-80 flex-col gap-2 overflow-y-scroll">
      {#if packs}
        {#each packs.filter(pack => {
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
            {#if download && pack.uris.some(uri => download!.originalUrl.startsWith(uri))}
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
