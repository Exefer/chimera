<script lang="ts">
  import { Button, buttonVariants } from "@/components/ui/button";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import { commands } from "@/specta-bindings";
  import { games } from "@/stores";
  import { open as openDialog } from "@tauri-apps/plugin-dialog";
  import { revealItemInDir } from "@tauri-apps/plugin-opener";
  import File from "lucide-svelte/icons/file";
  import { t } from "svelte-i18n";
  import { toast } from "svelte-sonner";

  interface GameOptionsModalProps {
    open: boolean;
  }

  let { open = $bindable(false) }: GameOptionsModalProps = $props();
  const gameDetailsContext = getGameDetailsContext();
  const { title, remoteId, game, packs } = $derived(gameDetailsContext);
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-xl font-bold text-muted-foreground">Executable</h2>
        <p class="text-sm text-muted-foreground">
          Path of the executable that will run when "Play" is clicked
        </p>
      </div>
      <div class="flex gap-2">
        <Input
          type="text"
          placeholder="No executable selected"
          value={game?.executable_path}
          readonly
        />
        <Button
          variant="outline"
          onclick={async () => {
            const executable = await openDialog({
              filters: [
                {
                  name: "Game executable",
                  extensions: ["exe", "lnk"],
                },
              ],
            });
            if (!executable) return;
            games.updateGame("remote_id", remoteId, game => ({
              ...game,
              executable_path: executable,
            }));
          }}
        >
          <File />
          Select
        </Button>
        {#if game?.executable_path}
          <Button
            variant="outline"
            onclick={() => {
              games.updateGame("remote_id", remoteId, game => ({
                ...game,
                executable_path: "",
              }));
            }}>{$t("game_details.clear")}</Button
          >
        {/if}
      </div>
      <div>
        <Button
          variant="outline"
          disabled={!game?.executable_path}
          onclick={() => {
            revealItemInDir(game?.executable_path!);
          }}>{$t("game_details.open_folder")}</Button
        >
        <Button
          variant="outline"
          disabled={!game?.executable_path}
          onclick={async () => {
            const result = await commands.createShortcut(game?.executable_path!);
            if (result.status == "ok") {
              toast.success($t("game_details.create_desktop_shortcut:success"));
            } else {
              toast.error("Failed to create shortcut");
            }
          }}>{$t("game_details.create_desktop_shortcut")}</Button
        >
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-bold text-muted-foreground">Downloads</h2>
        <p class="text-sm text-muted-foreground">
          Check out updates or other versions of this game
        </p>
      </div>
      <Button
        variant="outline"
        disabled={packs.length == 0}
        onclick={() => {
          gameDetailsContext.showDownloadOptionsModal = true;
        }}>Open download options</Button
      >

      <div class="space-y-2">
        <h2 class="text-xl font-bold text-muted-foreground">Danger Zone</h2>
        <p class="text-sm text-muted-foreground">
          Remove this game from your library or it's files
        </p>
      </div>

      <div class="flex gap-2">
        <Dialog.Root>
          <Dialog.Trigger class={buttonVariants({ variant: "destructive" })}
            >Remove from library</Dialog.Trigger
          >
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Are you sure?</Dialog.Title>
              <Dialog.Description>
                This will remove {title} from your library
              </Dialog.Description>
            </Dialog.Header>
            <Separator />
            <div class="flex justify-end gap-2">
              <Dialog.Close
                class={buttonVariants({ variant: "outline" })}
                onclick={() => {
                  games.removeGame(remoteId);
                  open = false;
                }}>Confirm</Dialog.Close
              >
              <Dialog.Close class={buttonVariants()}>Cancel</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button
                variant="destructive"
                disabled={!game?.executable_path}
                onclick={() => {
                  // Should remove files
                }}
                {...props}>Remove files</Button
              >
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
              <Dialog.Description>
                This will remove all the installation files for this game from your
                computer
              </Dialog.Description>
            </Dialog.Header>
            <Separator />
            <div class="flex justify-end gap-2">
              <Dialog.Close
                class={buttonVariants({ variant: "outline" })}
                disabled
                onclick={() => {
                  // Should delete installation files
                }}>Confirm</Dialog.Close
              >
              <Dialog.Close class={buttonVariants()}>Cancel</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
