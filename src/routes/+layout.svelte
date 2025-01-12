<script lang="ts">
 import { dev } from "$app/environment";
 import AppSidebar from "@/components/app-sidebar.svelte";
 import Header from "@/components/header";
 import * as Sidebar from "@/components/ui/sidebar";
 import { events } from "@/specta-bindings";
 import { gamesStore } from "@/store/games.store";
 import { settingsStore } from "@/store/settings.store";
 import { ModeWatcher } from "mode-watcher";
 import { onMount } from "svelte";
 import { Toaster } from "svelte-sonner";
 import "../app.css";

 let { children } = $props();

 onMount(async () => {
  events.executableStarted.listen(event => {
   gamesStore.updateGame(["executablePath", event.payload.path], state => ({
    ...state,
    running: true,
   }));
  });

  events.executableFinished.listen(event => {
   gamesStore.updateGame(["executablePath", event.payload.path], state => ({
    ...state,
    lastPlayedAt: Date.now(),
    playtimeInSeconds: state.playtimeInSeconds + event.payload.execution_time,
    running: false,
   }));
  });
 });
</script>

<Toaster theme={$settingsStore.theme} />
<ModeWatcher />

<Sidebar.Provider>
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
