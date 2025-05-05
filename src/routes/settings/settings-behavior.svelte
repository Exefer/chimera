<script lang="ts">
  import { Checkbox } from "@/components/ui/checkbox";
  import { Label } from "@/components/ui/label";
  import { settings } from "@/stores";
  import { t } from "svelte-i18n";

  let canLaunchMinimized = $derived($settings.minimizeToTray && $settings.runAtStartp);

  $effect(() => {
    if (!canLaunchMinimized) {
      $settings.launchMinimized = false;
    }
  });
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">{$t("settings.behavior:title")}</h1>
  <div class="flex items-center gap-2">
    <Checkbox id="minimize-to-tray" bind:checked={$settings.minimizeToTray} />
    <Label for="minimize-to-tray">{$t("settings.minimize_to_tray")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox id="launch-on-startup" bind:checked={$settings.runAtStartp} />
    <Label for="launch-on-startup">{$t("settings.run_at_startup")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox
      id="launch-minimized"
      bind:checked={$settings.launchMinimized}
      disabled={!canLaunchMinimized}
    />
    <Label for="launch-minimized">{$t("settings.launch_minimized")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox id="disable-nsfw-alert" bind:checked={$settings.disableNsfwAlert} />
    <Label for="disable-nsfw-alert">{$t("settings.disable_nsfw_alert")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox id="disable-nsfw-alert" bind:checked={$settings.extractFilesByDefault} />
    <Label for="extract-files-by-default">{$t("settings.extract_files_by_default")}</Label
    >
  </div>
</div>
