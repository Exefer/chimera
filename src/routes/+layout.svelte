<script lang="ts">
  import { dev } from "$app/environment";
  import AppSidebar from "@/components/app-sidebar.svelte";
  import BottomPanel from "@/components/bottom-panel.svelte";
  import Header from "@/components/header";
  import * as Sidebar from "@/components/ui/sidebar";
  import { events } from "@/specta-bindings";
  import { downloads, games, settings } from "@/stores";
  import * as Persistent from "@/stores/persistent";
  import { sleep } from "@/utils";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, untrack } from "svelte";
  import { init, locale, register, t } from "svelte-i18n";
  import { toast, Toaster } from "svelte-sonner";
  import "../app.css";

  let { children } = $props();

  $effect.pre(() => {
    register("en", () => import("../locales/en.json"));
    register("it", () => import("../locales/it.json"));

    init({
      fallbackLocale: "en",
      initialLocale: $settings.general.locale,
      ignoreTag: false,
    });

    untrack(() => locale.set($settings.general.locale));
  });

  onMount(() => {
    const appWindow = getCurrentWindow();

    appWindow.once("tauri://close-requested", () => {
      Promise.all(
        $downloads.map(async download => {
          if (download.status != "progress") return;
          toast.info(
            $t("layout.pausing_download_for", {
              values: { title: download.title },
            })
          );
          await downloads.pauseDownload(download.url);
        })
      ).then(async () => {
        toast.info($t("layout.saving_downloads"));
        await Persistent.downloads.set($downloads);
        toast.info($t("layout.closing"));
        await sleep(1000);
        await appWindow.close();
      });
    });

    events.executableEvent.listen(({ payload: { data, type } }) => {
      switch (type) {
        case "started": {
          games.updateGame("executable_path", data.path, state => ({
            ...state,
            running: true,
          }));
          break;
        }
        case "finished": {
          games.updateGame("executable_path", data.path, state => ({
            ...state,
            last_played_at: Date.now(),
            playtime_in_seconds: state.playtime_in_seconds + data.execution_time,
            running: false,
          }));
          break;
        }
      }
    });
  });
</script>

<Toaster theme={$settings.general.theme} />
<ModeWatcher />

<Sidebar.Provider>
  <AppSidebar />
  <div class="w-full">
    <Header />
    {@render children()}
  </div>
  <BottomPanel />
</Sidebar.Provider>

<svelte:window
  on:contextmenu|preventDefault
  on:keydown={event => {
    if (dev) return;
    if (
      event.key === "F5" ||
      (event.ctrlKey && event.key === "r") ||
      (event.metaKey && event.key === "r")
    ) {
      event.preventDefault();
    }
  }}
/>
