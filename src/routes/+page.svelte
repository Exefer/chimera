<script lang="ts">
 import "$lib/i18n";
 import { appsList } from "@/store/state.store";
 import { onMount } from "svelte";

 onMount(async () => {
  await fetch(
   "https://raw.githubusercontent.com/hydralauncher/hydra/refs/heads/main/seeds/steam-games.json",
  )
   .then(response => response.json())
   .then(data => appsList.set(data));
 });
</script>
