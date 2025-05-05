<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import { LibraryManager } from "@/services/library-manager";
  import { formatSeconds } from "@/utils";
  import { date, t } from "svelte-i18n";
  import { toast } from "svelte-sonner";
  import { formatDistanceToNow } from "date-fns";
  import CirclePause from "lucide-svelte/icons/circle-pause";
  import CirclePlay from "lucide-svelte/icons/circle-play";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import DownloadIcon from "lucide-svelte/icons/download";
  import Heart from "lucide-svelte/icons/heart";
  import SettingsIcon from "lucide-svelte/icons/settings";

  const gameDetailsContext = getGameDetailsContext();
  const { game, packs, title, objectId, download } = $derived(gameDetailsContext);
</script>

<div class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm">
  <div class="flex flex-col justify-center">
    {#if !game}
      {#if packs.length > 0}
        {@const [updatedAt] = packs
          .map(pack => new Date(pack.uploadDate))
          .toSorted((a, b) => b.valueOf() - a.valueOf())}
        <p>
          {$t("game.updated_at", {
            values: { date: $date(updatedAt) },
          })}
        </p>
        <p>
          {$t("game.count_download_options", {
            values: { count: packs.length },
          })}
        </p>
      {:else}
        <p>{$t("game.no_downloads")}</p>
      {/if}
    {:else if game?.running}
      <p>{$t("game.playing_now")}</p>
    {:else if game?.playtimeInSeconds}
      <p>
        {$t("game.played_for_time", {
          values: { time: formatSeconds(game.playtimeInSeconds) },
        })}
      </p>
      {#if game.lastPlayedAt && !game.running}
        <p>
          {$t("game.last_time_played", {
            values: {
              time: formatDistanceToNow(game.lastPlayedAt, { addSuffix: true }),
            },
          })}
        </p>
      {/if}
    {:else if !game?.running && !game?.playtimeInSeconds}
      <p>{$t("game.not_played_yet", { values: { title } })}</p>
    {/if}

    {#if download && download.status === "progress"}
      <div class="flex items-center gap-2 text-muted-foreground">
        <a href="/downloads" class="underline underline-offset-1">
          {$t("game.download_in_progress")}
        </a>
        <span class="text-xs">{download.progress?.toFixed(1)}%</span>
      </div>
    {/if}
  </div>
  <div class="flex gap-4">
    <Button
      variant="outline"
      disabled={(download && download.status === "progress") ||
        (game && !game.executablePath && packs.length === 0)}
      onclick={() => {
        if (!game) {
          LibraryManager.addGameToLibrary(objectId, title);
        } else if (!game.executablePath) {
          gameDetailsContext.showDownloadOptionsModal = true;
        } else if (game.executablePath && !game.running) {
          LibraryManager.openGame(objectId);
        } else if (game.running) {
          LibraryManager.closeGame(objectId);
        }
      }}
    >
      {#if !game}
        <CirclePlus />
        {$t("game.add_to_library")}
      {:else if game?.running}
        <CirclePause />
        {$t("game.stop")}
      {:else if game?.executablePath}
        <CirclePlay />
        {$t("game.play")}
      {:else if !game?.executablePath}
        <DownloadIcon />
        {$t("game.download")}
      {/if}
    </Button>
    {#if game}
      <Separator orientation="vertical" />
      <Button
        variant="outline"
        size="icon"
        onclick={() => {
          if (game.favorite) {
            LibraryManager.removeGameFromFavorites(game.objectId);
            toast.success($t("game.added_to_favorites"), { id: "favorited_game" });
          } else {
            LibraryManager.addGameToFavorites(game.objectId);
            toast.success($t("game.removed_from_favorites"), { id: "favorited_game" });
          }
        }}><Heart class={game.favorite ? "fill-foreground" : "fill-none"} /></Button
      >
    {/if}
    {#if game || packs.length > 0}
      <Button
        variant="outline"
        onclick={() => {
          if (game) {
            gameDetailsContext.showGameOptionsModal = true;
          } else {
            gameDetailsContext.showDownloadOptionsModal = true;
          }
        }}
      >
        {#if game}
          <SettingsIcon />
          {$t("game.options")}
        {:else}
          {$t("game.open_download_options")}
        {/if}
      </Button>
    {/if}
  </div>
  {#if download && download.status === "progress"}
    <progress
      max="100"
      class="absolute bottom-0 left-0 h-1 w-full"
      value={Math.trunc(download.progress!)}
    ></progress>
  {/if}
</div>
