<script lang="ts">
  import { initSteamGamesStores } from "@/bootstrap";
  import AppSidebar from "@/components/app-sidebar.svelte";
  import BottomPanel from "@/components/bottom-panel.svelte";
  import Header from "@/components/header.svelte";
  import * as Sidebar from "@/components/ui/sidebar";
  import { Toaster } from "@/components/ui/sonner";
  import { useDownload, usePacks } from "@/hooks";
  import { useLibrary } from "@/hooks/use-library";
  import {
    onDownloadCompleted,
    onDownloadProgress,
    onDownloadRateLimitExceeded,
  } from "@/services/download/download-manager.events";
  import { onProcessFinished, onProcessStarted } from "@/services/library-manager.events";
  import { events } from "@/specta-bindings";
  import { settings } from "@/stores";
  import { dev } from "$app/environment";
  import { onMount, untrack } from "svelte";
  import { init, locale, register } from "svelte-i18n";
  import { ModeWatcher } from "mode-watcher";
  import "../app.css";

  let { children } = $props();

  const { updateLibrary } = useLibrary();
  const { updatePacks } = usePacks();
  const { updateDownloads } = useDownload();

  onMount(() => {
    updateLibrary();
    updatePacks();
    updateDownloads();

    initSteamGamesStores();

    // TODO: Refactor
    events.processEvent.listen(({ payload: { data, type } }) => {
      switch (type) {
        case "started": {
          onProcessStarted(data);
          break;
        }
        case "finished": {
          onProcessFinished(data);
          break;
        }
      }
    });
    //

    events.downloadEvent.listen(({ payload: { type, data } }) => {
      switch (type) {
        case "progress": {
          onDownloadProgress(data);
          break;
        }
        case "completed": {
          onDownloadCompleted(data);
          break;
        }
        case "rate_limit_exceeded": {
          onDownloadRateLimitExceeded(data);
          break;
        }
        case "paused": {
          break;
        }
        case "aborted": {
          break;
        }
      }
    });

    // Scoped broadcast channels
    {
      const channel = new BroadcastChannel("download_sources:sync");

      channel.onmessage = () => {
        updatePacks();
      };
    }
  });

  $effect.pre(() => {
    register("en", () => import("../locales/en.json"));
    register("it", () => import("../locales/it.json"));

    init({
      fallbackLocale: "en",
      initialLocale: $settings.locale,
      ignoreTag: false,
    });

    untrack(() => locale.set($settings.locale));
  });
</script>

<Toaster theme={$settings.theme} />

<ModeWatcher />

<Sidebar.Provider>
  <AppSidebar />
  <div class="w-full bg-background">
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
