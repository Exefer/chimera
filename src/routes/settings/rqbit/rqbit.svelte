<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { TorrentApi } from "@/raw-bindings";
  import { settings } from "@/stores";
  import Dht from "./dht.svelte";
  import PeerOptions from "./peer-options.svelte";
  import Session from "./session.svelte";

  const tabs = [
    {
      name: () => "DHT",
      component: Dht,
    },
    {
      name: () => "Session",
      component: Session,
    },
    {
      name: () => "Peer options",
      component: PeerOptions,
    },
  ];

  let selected = $state(tabs[0]);

  $effect(() => {
    TorrentApi.applyTorrentConfig($settings.rqbit);
  });
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">Rqbit</h1>
  <div class="flex gap-2">
    {#each tabs as tab}
      <Button
        variant={selected.name() === tab.name() ? "default" : "outline"}
        onclick={() => {
          selected = tab;
        }}>{tab.name()}</Button
      >
    {/each}
  </div>
  <selected.component />
</div>
