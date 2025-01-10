<script lang="ts">
 import { Button } from "@/components/ui/button";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import * as Select from "@/components/ui/select";
 import { settingsStore } from "@/store/settings.store";
 import * as Types from "@/types";
 import { capitalize } from "@/utils";
 import { open } from "@tauri-apps/plugin-dialog";
 import { resetMode, setMode } from "mode-watcher";
</script>

<h1 class="text-2xl font-bold">General</h1>

<div class="space-y-1">
 <Label for="downloads-path">Downloads Path</Label>
 <div class="flex gap-4">
  <Input
   type="text"
   name="downloads-path"
   bind:value={$settingsStore.downloadsPath}
   readonly
  />
  <Button
   variant="outline"
   onclick={async () => {
    const folder = await open({ multiple: false, directory: true });

    if (!folder) return;

    settingsStore.updateSettings({ downloadsPath: folder });
   }}>Update</Button
  >
 </div>
</div>

<div>
 <Label for="theme">Theme</Label>
 <Select.Root
  type="single"
  name="theme"
  bind:value={() => $settingsStore.theme,
  theme => {
   theme == "system" ? resetMode() : setMode(theme as Types.AppTheme);
   settingsStore.updateSettings({ theme });
  }}
 >
  <Select.Trigger class="w-[180px]"
   >{capitalize($settingsStore.theme)}</Select.Trigger
  >
  <Select.Content>
   <Select.Item value="light">Light</Select.Item>
   <Select.Item value="dark">Dark</Select.Item>
   <Select.Item value="system">System</Select.Item>
  </Select.Content>
 </Select.Root>
</div>

<h2 class="text-lg font-bold">Notifications</h2>

<div class="flex items-center gap-2">
 <Checkbox
  id="download-complete"
  bind:checked={$settingsStore.notifyOnDownloadComplete}
 />
 <Label for="download-complete">When a download is complete</Label>
</div>
