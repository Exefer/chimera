<script lang="ts">
  import { SteamContentDescriptor } from "@/constants";
  import { setGameContext } from "@/context";
  import { usePacks } from "@/hooks/use-packs";
  import { getGameDetails } from "@/services/games";
  import { downloads, games, settings } from "@/stores";
  import * as Types from "@/types";
  import * as Steam from "@/types/steam.types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { t } from "svelte-i18n";
  import { toast } from "svelte-sonner";
  import GameContent from "./game-content.svelte";
  import {
    DownloadOptionsModal,
    DownloadSettingsModal,
    GameOptionsModal,
    NsfwAlertModal,
  } from "./modals";

  const { getObservablePacksForRemoteId } = usePacks();

  const title = $derived(page.url.searchParams.get("title")!);
  const remoteId = $derived(page.url.searchParams.get("id")!);
  const local = $derived($games.find(game => game.remote_id === remoteId));
  const download = $derived($downloads.find(download => download.remote_id === remoteId));
  const packs = $derived.by(() => {
    remoteId;
    return getObservablePacksForRemoteId(remoteId);
  });

  let details = $state<Steam.AppDetails | null>(null);
  let selectedPackDownload = $state<Types.Pack | null>(null);
  let showDownloadOptionsModal = $state(false);
  let showGameOptionsModal = $state(false);
  let hasNSFWContentBlocked = $state(false);

  $effect(() => {
    getGameDetails(remoteId).then(async data => {
      hasNSFWContentBlocked =
        data!.content_descriptors.ids.includes(
          SteamContentDescriptor.AdultOnlySexualContent
        ) && !$settings.behavior.disable_nsfw_alert;
      details = data;
    });

    return () => {
      details = null;
    };
  });
  /* END OF TESTING */
  setGameContext({
    get title() {
      return title;
    },
    get remoteId() {
      return remoteId;
    },
    get local() {
      return local;
    },
    get download() {
      return download;
    },
    get details() {
      return details;
    },
    get packs() {
      return packs;
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
  <GameContent />

  <GameOptionsModal bind:open={showGameOptionsModal} />

  <DownloadOptionsModal
    bind:open={showDownloadOptionsModal}
    onPackSelected={pack => (selectedPackDownload = pack)}
  />

  <DownloadSettingsModal
    open={selectedPackDownload !== null}
    {selectedPackDownload}
    onDownloadStarted={() => {
      showDownloadOptionsModal = false;
      showGameOptionsModal = false;
      selectedPackDownload = null;
    }}
    onDownloadErrored={() => {
      toast.error($t("common.an_error_occurred"));
    }}
    onClose={() => (selectedPackDownload = null)}
  />

  <NsfwAlertModal
    onCancel={() => {
      goto("/");
    }}
    onConfirm={() => {
      hasNSFWContentBlocked = false;
    }}
  />
</main>
