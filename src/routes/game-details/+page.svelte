<script lang="ts">
  import { Downloader, SteamContentDescriptor } from "@/constants";
  import { setGameDetailsContext } from "@/context";
  import type { PackEntry } from "@/database";
  import { useDownload, usePacks } from "@/hooks";
  import { getSteamAppDetails } from "@/services/steam";
  import { downloads, library, settings } from "@/stores";
  import type { SteamAppDetails } from "@/types/steam.types";
  import { getDownloaderForUrl } from "@/utils";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { t } from "svelte-i18n";
  import { toast } from "svelte-sonner";
  import GameContent from "./game-details-content.svelte";
  import {
    DownloadOptionsModal,
    DownloadSettingsModal,
    GameOptionsModal,
    NsfwAlertModal,
  } from "./modals";

  const { getPacksForObjectId } = usePacks();
  const { startDownload } = useDownload();

  const title = $derived(page.url.searchParams.get("title")!);
  const objectId = $derived(page.url.searchParams.get("id")!);
  const game = $derived($library.find(game => game.objectId === objectId));
  const download = $derived($downloads.find(download => download.objectId === objectId));

  let details = $state<SteamAppDetails | null>(null);
  let packs = $state<PackEntry[]>([]);
  let selectedPack = $state<PackEntry | null>(null);
  let showDownloadOptionsModal = $state(false);
  let showGameOptionsModal = $state(false);
  let hasNSFWContentBlocked = $state(false);

  $effect(() => {
    getSteamAppDetails(objectId).then(async data => {
      hasNSFWContentBlocked =
        data!.content_descriptors.ids.includes(
          SteamContentDescriptor.AdultOnlySexualContent
        ) && !$settings.disableNsfwAlert;
      details = data;
    });

    packs = getPacksForObjectId(objectId);

    return () => {
      details = null;
      packs = [];
    };
  });

  setGameDetailsContext({
    get title() {
      return title;
    },
    get objectId() {
      return objectId;
    },
    get game() {
      return game;
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
  const selectPackUri = (pack: PackEntry, downloader: Downloader) =>
    pack.uris.find(url => getDownloaderForUrl(url) === downloader)!;

  const handleStartDownload = (
    pack: PackEntry,
    downloader: Downloader,
    downloadPath: string,
    automaticallyExtract: boolean
  ) => {
    startDownload({
      url: selectPackUri(pack, downloader),
      downloadPath,
      downloader,
      title,
      objectId,
      automaticallyExtract,
    });
    showDownloadOptionsModal = false;
    showGameOptionsModal = false;
    selectedPack = null;
  };
</script>

<main>
  <GameContent />

  <GameOptionsModal bind:open={showGameOptionsModal} />

  <DownloadOptionsModal
    bind:open={showDownloadOptionsModal}
    onPackSelected={pack => {
      selectedPack = pack;
      showDownloadOptionsModal = false;
    }}
  />

  <DownloadSettingsModal
    open={selectedPack !== null}
    {selectedPack}
    onDownloadErrored={() => {
      toast.error($t("common.an_error_occurred"));
    }}
    {handleStartDownload}
    onClose={() => (selectedPack = null)}
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
