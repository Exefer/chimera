<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { SteamContentDescriptor } from "@/constants";
  import { setGameDetailsContext } from "@/context";
  import { getSteamAppDetails } from "@/services/steam";
  import { appsByLetter, games, settings, sources } from "@/stores";
  import * as Types from "@/types";
  import * as Steam from "@/types/steam.types";
  import { formatTitle } from "@/utils";
  import GameDetailsContent from "./game-details-content.svelte";
  import {
    DownloadOptionsModal,
    DownloadSettingsModal,
    GameOptionsModal,
    NsfwAlertModal,
  } from "./modals";

  const title = $derived(page.url.searchParams.get("title")!);
  const remoteId = $derived(page.url.searchParams.get("id")!);
  const game = $derived($games.find(game => game.remote_id == remoteId));

  let selectedPackDownload = $state<Types.Pack | null>(null);
  let showDownloadOptionsModal = $state(false);
  let showGameOptionsModal = $state(false);
  let appDetails = $state<Steam.AppDetails | null>(null);
  let hasNSFWContentBlocked = $state(false);

  $effect(() => {
    getSteamAppDetails(remoteId).then(data => {
      appDetails = data;
      hasNSFWContentBlocked =
        appDetails!.content_descriptors.ids.includes(
          SteamContentDescriptor.AdultOnlySexualContent
        ) && !$settings.behavior.disable_nsfw_alert;
    });

    return () => {
      appDetails = null;
    };
  });
  /* TESTING: Proof of concept
   * Can throw error if source is not found
   */
  const source = $sources[0];

  const remoteIdsOnSource = new Set<string>();
  const results = $derived(
    source.downloads.map(download => {
      const formattedTitle = formatTitle(download.title);
      const [firstLetter] = formattedTitle;
      const gamesInSteam = ($appsByLetter[firstLetter] || []).filter(app =>
        formattedTitle.startsWith(app.name)
      );

      gamesInSteam.forEach(game => remoteIdsOnSource.add(String(game.id)));

      return {
        ...download,
        packer: source.name,
        remoteIds: gamesInSteam.map(app => String(app.id)),
      };
    })
  );
  const packs = $derived(results.filter(result => result.remoteIds.includes(remoteId)));
  /* END OF TESTING */
  setGameDetailsContext({
    get title() {
      return title;
    },
    get remoteId() {
      return remoteId;
    },
    get game() {
      return game;
    },
    get packs() {
      return packs;
    },
    get appDetails() {
      return appDetails;
    },
    get hasNSFWContentBlocked() {
      return hasNSFWContentBlocked;
    },
    get showDownloadOptionsModal() {
      return showDownloadOptionsModal;
    },
    get showGameOptionsModal() {
      return showGameOptionsModal;
    },
    set showDownloadOptionsModal(value) {
      showDownloadOptionsModal = value;
    },
    set showGameOptionsModal(value) {
      showGameOptionsModal = value;
    },
  });
</script>

<main>
  <GameDetailsContent />

  <GameOptionsModal bind:open={showGameOptionsModal} />

  <DownloadOptionsModal bind:open={showDownloadOptionsModal} bind:selectedPackDownload />

  <DownloadSettingsModal {selectedPackDownload} />

  <NsfwAlertModal
    onCancel={() => {
      /* TODO: Use browser history */
      goto("/");
    }}
    onConfirm={() => {
      hasNSFWContentBlocked = false;
    }}
  />
</main>
