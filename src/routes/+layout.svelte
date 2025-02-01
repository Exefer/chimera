<script lang="ts">
 import { dev } from "$app/environment";
 import AppSidebar from "@/components/app-sidebar.svelte";
 import BottomPanel from "@/components/bottom-panel.svelte";
 import Header from "@/components/header";
 import * as Sidebar from "@/components/ui/sidebar";
 import { events } from "@/specta-bindings";
 import { games, settings } from "@/stores";
 import { ModeWatcher } from "mode-watcher";
 import { onMount } from "svelte";
 import { Toaster } from "svelte-sonner";
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
     games.updateGame(["executablePath", data.path], state => ({
      ...state,
      running: true,
     }));
     break;
    }
    case "finished": {
     games.updateGame(["executablePath", data.path], state => ({
      ...state,
      lastPlayedAt: Date.now(),
      playtimeInSeconds: state.playtimeInSeconds + data.execution_time,
      running: false,
     }));
     break;
    }
   }
  });
 });
</script>

<Toaster theme={$settings.theme} />
<ModeWatcher />

<BottomPanel />
<Sidebar.Provider style="--sidebar-width: 14rem; --sidebar-width-mobile: 20rem;">
 <AppSidebar />
 <main class="w-full">
  <Header />
  <aside>{@render children()}</aside>
 </main>
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
