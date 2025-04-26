<script lang="ts">
  import { Button } from "@ui/button";
  import { Separator } from "@ui/separator";
  import { getGameContext } from "@/context";
  import { steamImageBuilder } from "@/services/steam";
  import { commands } from "@/specta-bindings";
  import { apps, games } from "@/stores";
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

  const gameContext = getGameContext();
  const { game, packs, title, remoteId, download } = $derived(gameContext);
</script>

<div class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm">
  <div class="flex flex-col justify-center">
    {#if !game && $packs}
      {@const [updatedAt] = $packs
        .map(pack => new Date(pack.uploadDate))
        .toSorted((a, b) => b.valueOf() - a.valueOf())}
      {#if updatedAt}
        <p>
          {$t("game.updated_at", {
            values: { date: $date(updatedAt) },
          })}
        </p>
      {/if}
      {#if $packs.length > 0}
        <p>
          {$t("game.count_download_options", {
            values: { count: $packs.length },
          })}
        </p>
      {:else}
        <p>{$t("game.no_downloads")}</p>
      {/if}
    {:else if game?.running}
      <p>{$t("game.playing_now")}</p>
    {:else if game?.playtime_in_seconds}
      <p>
        {$t("game.played_for_time", {
          values: { time: formatSeconds(game.playtime_in_seconds) },
        })}
      </p>
      {#if game.last_played_at && !game.running}
        <p>
          {$t("game.last_time_played", {
            values: {
              time: formatDistanceToNow(game.last_played_at, { addSuffix: true }),
            },
          })}
        </p>
      {/if}
    {:else if !game?.running && !game?.playtime_in_seconds}
      <p>{$t("game.not_played_yet", { values: { title } })}</p>
    {/if}

    {#if download && download.status === "progress"}
      <div class="flex items-center gap-2 text-muted-foreground">
        <a href="/downloads" class="underline underline-offset-1">
          {$t("game.download_in_progress")}
        </a>
        <span class="text-xs">{download.progress_percentage?.toFixed(1)}%</span>
      </div>
    {/if}
  </div>
  <div class="flex gap-4">
    <Button
      variant="outline"
      disabled={game?.running ||
        (game && $packs && $packs.length === 0) ||
        (download && download!.status === "progress")}
      onclick={() => {
        if (!game) {
          games.addGame({
            title,
            remote_id: remoteId,
            icon_url: steamImageBuilder.icon(
              remoteId,
              $apps.find(app => app.id === remoteId)?.clientIcon!
            ),
          });
        } else if (!game.executable_path) {
          gameContext.showDownloadOptionsModal = true;
        } else if (game.executable_path && !game.running) {
          commands.runExecutable(game.executable_path);
        } else if (game.running) {
          // Should close
        }
      }}
    >
      {#if !game}
        <CirclePlus />
        {$t("game.add_to_library")}
      {:else if game?.running}
        <CirclePause />
        {$t("game.stop")}
      {:else if game?.executable_path}
        <CirclePlay />
        {$t("game.play")}
      {:else if !game?.executable_path}
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
          games.updateGame("remote_id", remoteId, game => ({
            ...game,
            favorite: !game.favorite,
          }));

          if (game.favorite) {
            toast.success($t("game.added_to_favorites"), { id: "favorited_game" });
          } else {
            toast.success($t("game.removed_from_favorites"), { id: "favorited_game" });
          }
        }}><Heart class={game.favorite ? "fill-foreground" : "fill-none"} /></Button
      >
    {/if}
    {#if game || ($packs && $packs.length > 0)}
      <Button
        variant="outline"
        onclick={() => {
          if (game) {
            gameContext.showGameOptionsModal = true;
          } else {
            gameContext.showDownloadOptionsModal = true;
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
      value={Math.trunc(download.progress_percentage!)}
    ></progress>
  {/if}
</div>
