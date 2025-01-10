<script lang="ts">
 import { Checkbox } from "@/components/ui/checkbox";
 import { Label } from "@/components/ui/label";
 import { settingsStore } from "@/store/settings.store";
</script>

<h1 class="text-2xl font-bold">Behavior</h1>

<div class="flex items-center gap-2">
 <Checkbox id="minimize-to-tray" bind:checked={$settingsStore.minimizeToTray} />
 <Label for="minimize-to-tray">Minimize to Tray</Label>
</div>

<div class="flex items-center gap-2">
 <Checkbox
  id="launch-on-startup"
  bind:checked={$settingsStore.launchOnStartup}
 />
 <Label for="launch-on-startup">Launch on system startup</Label>
</div>

<div class="flex items-center gap-2">
 <Checkbox
  id="launch-minimized"
  bind:checked={$settingsStore.launchMinimized}
 />
 <Label for="launch-minimized">Launch minimized</Label>
</div>
