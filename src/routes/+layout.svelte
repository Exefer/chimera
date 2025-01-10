<script lang="ts">
 import AppSidebar from "@/components/app-sidebar.svelte";
 import Header from "@/components/header";
 import * as Sidebar from "@/components/ui/sidebar";
 import { events } from "@/specta-bindings";
 import { isTauri } from "@tauri-apps/api/core";
 import { ModeWatcher } from "mode-watcher";
 import { onMount } from "svelte";
 import { toast, Toaster } from "svelte-sonner";
 import "../app.css";

 let { children } = $props();

 onMount(async () => {
  events.executableStarted.listen(event => {
   toast.info(`${event.payload.path} was opened!`);
  });

  events.executableFinished.listen(event => {
   toast.info(
    `${event.payload.path} was closed! Process ran for ${event.payload.execution_time} seconds`,
   );
  });
 });
</script>

<Toaster />
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
  if (!isTauri()) return;
  if (
   event.key === "F5" ||
   (event.ctrlKey && event.key === "r") ||
   (event.metaKey && event.key === "r")
  ) {
   event.preventDefault();
  }
 }}
/>
