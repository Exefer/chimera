<script lang="ts">
 import { Button } from "@/components/ui/button";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import * as Select from "@/components/ui/select";
 import { settings } from "@/stores";
 import * as Types from "@/types";
 import { capitalize } from "@/utils";
 import { open } from "@tauri-apps/plugin-dialog";
 import { resetMode, setMode } from "mode-watcher";
 import { locale, locales } from "svelte-i18n";
</script>

<h1 class="text-2xl font-bold">General</h1>

<div class="space-y-1">
 <Label for="downloads-path">Downloads Path</Label>
 <div class="flex gap-4">
  <Input type="text" name="downloads-path" value={$settings.downloadsPath} readonly />
  <Button
   variant="outline"
   onclick={async () => {
    const folder = await open({ multiple: false, directory: true });
    if (!folder) return;
    settings.updateSettings({ downloadsPath: folder });
   }}>Update</Button
  >
 </div>
</div>

<div>
 <Label for="theme">Theme</Label>
 <Select.Root
  type="single"
  name="theme"
  bind:value={() => $settings.theme,
  theme => {
   theme == "system" ? resetMode() : setMode(theme);
   settings.updateSettings({ theme });
  }}
 >
  <Select.Trigger class="w-[180px]">{capitalize($settings.theme)}</Select.Trigger>
  <Select.Content>
   <Select.Item value="light">Light</Select.Item>
   <Select.Item value="dark">Dark</Select.Item>
   <Select.Item value="system">System</Select.Item>
  </Select.Content>
 </Select.Root>
</div>

<div>
 <Label for="theme">Language</Label>
 <Select.Root
  type="single"
  name="theme"
  bind:value={() => $locale!,
  locale => {
   $settings.locale = (locale || "en") as Types.Locale;
  }}
 >
  <Select.Trigger class="w-[180px]">{$locale!}</Select.Trigger>
  <Select.Content>
   {#each $locales as locale}
    <Select.Item value={locale}>{locale}</Select.Item>
   {/each}
  </Select.Content>
 </Select.Root>
</div>

<h2 class="text-lg font-bold">Notifications</h2>

<div class="flex items-center gap-2">
 <Checkbox
  id="notify-on-download-complete"
  bind:checked={$settings.notifyOnDownloadComplete}
 />
 <Label for="notify-on-download-complete">When a download is complete</Label>
</div>
