<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import * as Types from "@/types";
  import { t } from "svelte-i18n";

  interface DownloadOptionsModalProps {
    open: boolean;
    selectedPackDownload: Types.Pack | null;
  }

  let {
    open = $bindable(false),
    selectedPackDownload = $bindable<Types.Pack | null>(null),
  }: DownloadOptionsModalProps = $props();
  const { packs } = getGameDetailsContext();
  let filter = $state("");
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t("game_details.download_options")}</Dialog.Title>
    </Dialog.Header>

    <Separator />
    <Input
      type="text"
      bind:value={filter}
      placeholder={$t("game_details.filter_packs")}
    />
    <div class="flex flex-col gap-2">
      {#each packs.filter(pack => {
        const lowercaseFilter = filter.toLowerCase();
        return pack.title.toLowerCase().includes(lowercaseFilter) || pack.packer
            .toLowerCase()
            .includes(lowercaseFilter);
      }) as pack}
        <button
          class="flex flex-col gap-2 rounded-md border bg-primary-foreground p-4 text-left hover:bg-primary-foreground/80 dark:border-none"
          onclick={() => {
            selectedPackDownload = pack;
          }}
        >
          <p class="text-wrap text-sm">{pack.title}</p>
          <p class="text-xs text-muted-foreground">
            {pack.fileSize} - {pack.packer} - {new Date(
              pack.uploadDate
            ).toLocaleDateString()}
          </p>
        </button>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
