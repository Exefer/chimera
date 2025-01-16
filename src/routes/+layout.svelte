<script lang="ts">
 import { dev } from "$app/environment";
 import AppSidebar from "@/components/app-sidebar.svelte";
 import BottomPanel from "@/components/bottom-panel.svelte";
 import Header from "@/components/header";
 import * as Sidebar from "@/components/ui/sidebar";
 import { GoFileAPI } from "@/services/hosters/gofile";
 import { events } from "@/specta-bindings";
 import { games, settings } from "@/stores";
 import { ModeWatcher } from "mode-watcher";
 import { onMount } from "svelte";
 import { Toaster } from "svelte-sonner";
 import "../app.css";

 let { children } = $props();

 onMount(async () => {
  events.executableStartedEvent.listen(async ({ payload }) => {
   GoFileAPI.authorize().then(token => {
    GoFileAPI.getDownloadLink("4ZInBP").then(url => {});
   });

   games.updateGame(["executablePath", payload.path], state => ({
    ...state,
    running: true,
   }));
  });

  events.executableFinishedEvent.listen(({ payload }) => {
   games.updateGame(["executablePath", payload.path], state => ({
    ...state,
    lastPlayedAt: Date.now(),
    playtimeInSeconds: state.playtimeInSeconds + payload.execution_time,
    running: false,
   }));
  });
 });
</script>

<Toaster theme={$settings.theme} />
<ModeWatcher />

<BottomPanel />
<Sidebar.Provider
 style="--sidebar-width: 14rem; --sidebar-width-mobile: 20rem;"
>
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
