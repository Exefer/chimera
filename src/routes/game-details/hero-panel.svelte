<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import { steamImageBuilder } from "@/services/steam";
  import { commands } from "@/specta-bindings";
  import { apps, downloads, games } from "@/stores";
  import { formatSeconds } from "@/utils";
  import { formatDistanceToNow } from "date-fns";
  import CirclePause from "lucide-svelte/icons/circle-pause";
  import CirclePlay from "lucide-svelte/icons/circle-play";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import DownloadIcon from "lucide-svelte/icons/download";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import { t } from "svelte-i18n";

  const gameDetailsContext = getGameDetailsContext();
  const { game, packs, title, remoteId } = $derived(gameDetailsContext);
  const download = $derived($downloads.find(download => download.remote_id === remoteId));
</script>

<div class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm">
  <div class="flex flex-col justify-center">
    {#if !game}
      {@const [updatedAt] = packs
        .map(pack => new Date(pack.uploadDate))
        .toSorted((a, b) => b.valueOf() - a.valueOf())}
      {#if updatedAt}
        <p>
          {$t("game_details.updated_at", {
            values: { date: updatedAt.toLocaleDateString() },
          })}
        </p>
      {/if}
      {#if packs.length > 0}
        <p>
          {$t("game_details.count_download_options", {
            values: { count: packs.length },
          })}
        </p>
      {:else}
        <p>{$t("game_details.no_downloads")}</p>
      {/if}
    {:else if game?.running}
      <p>{$t("game_details.playing_now")}</p>
    {:else if game?.playtime_in_seconds}
      <p>
        {$t("game_details.played_for_time", {
          values: { time: formatSeconds(game.playtime_in_seconds) },
        })}
      </p>
      {#if game.last_played_at && !game.running}
        <p>
          {$t("game_details.last_time_played", {
            values: {
              time: formatDistanceToNow(game.last_played_at, { addSuffix: true }),
            },
          })}
        </p>
      {/if}
    {:else if !game?.running && !game?.playtime_in_seconds}
      <p>{$t("game_details.not_played_yet", { values: { title } })}</p>
    {/if}

    {#if download && download.status === "progress"}
      <div class="flex items-center gap-2 text-muted-foreground">
        <a href="/downloads" class="underline underline-offset-1">
          {$t("game_details.download_in_progress")}
        </a>
        <span class="text-xs">{download.progress_percentage?.toFixed(1)}%</span>
      </div>
    {/if}
  </div>
  <div class="flex gap-4">
    <Button
      variant="outline"
      disabled={game?.running || (game && packs.length === 0) || !!download}
      onclick={() => {
        if (!game) {
          games.addGame({
            title,
            remote_id: remoteId,
            icon_url: steamImageBuilder.icon(
              remoteId,
              $apps.find(app => app.id === Number(remoteId))?.clientIcon!
            ),
          });
        } else if (!game.executable_path) {
          gameDetailsContext.showDownloadOptionsModal = true;
        } else if (game.executable_path && !game.running) {
          commands.runExecutable(game.executable_path);
        } else if (game.running) {
          // Should close
        }
      }}
    >
      {#if !game}
        <CirclePlus />
        {$t("game_details.add_to_library")}
      {:else if game?.running}
        <CirclePause />
        {$t("game_details.stop")}
      {:else if game?.executable_path}
        <CirclePlay />
        {$t("game_details.play")}
      {:else if !game?.executable_path}
        <DownloadIcon />
        {$t("game_details.download")}
      {/if}
    </Button>
    {#if game}
      <Separator orientation="vertical" />
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
          {$t("game_details.options")}
        {:else}
          {$t("game_details.open_download_options")}
        {/if}
      </Button>
    {/if}
  </div>
</div>
