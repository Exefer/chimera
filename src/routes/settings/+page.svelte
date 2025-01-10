<script lang="ts">
 import { Button } from "@/components/ui/button";
 import Behaviour from "./behavior.svelte";
 import General from "./general.svelte";
 import Sources from "./sources.svelte";

 const tabs = [
  {
   name: "General",
   component: General,
  },
  {
   name: "Behaviour",
   component: Behaviour,
  },
  {
   name: "Sources",
   component: Sources,
  },
 ];

 let selected = $state(tabs[0]);
</script>

<div class="p-4">
 <div class="flex h-fit flex-col gap-4 rounded-lg border bg-background p-6">
  <div class="flex gap-2">
   {#each tabs as tab}
    <Button
     variant={tab.name == selected.name ? "default" : "outline"}
     onclick={() => {
      selected = tab;
     }}>{tab.name}</Button
    >
   {/each}
  </div>
  <selected.component />
 </div>
</div>

<style>
 :global(button[role="checkbox"] + label) {
  font-weight: normal;
 }
</style>
