<script lang="ts">
  import { Checkbox } from "@/components/ui/checkbox";
  import { Label } from "@/components/ui/label";
  import { settings } from "@/stores";
  import { t } from "svelte-i18n";

  let canLaunchMinimized = $derived(
    $settings.behavior.minimize_to_tray && $settings.behavior.launch_on_startup
  );

  $effect(() => {
    if (!canLaunchMinimized) {
      $settings.behavior.launch_minimized = false;
    }
  });
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">{$t("settings.behavior:title")}</h1>
  <div class="flex items-center gap-2">
    <Checkbox id="minimize-to-tray" bind:checked={$settings.behavior.minimize_to_tray} />
    <Label for="minimize-to-tray">{$t("settings.behavior.minimize_to_tray")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox
      id="launch-on-startup"
      bind:checked={$settings.behavior.launch_on_startup}
    />
    <Label for="launch-on-startup">{$t("settings.behavior.launch_on_startup")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox
      id="launch-minimized"
      bind:checked={$settings.behavior.launch_minimized}
      disabled={!canLaunchMinimized}
    />
    <Label for="launch-minimized">{$t("settings.behavior.launch_minimized")}</Label>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox
      id="disable-nsfw-alert"
      bind:checked={$settings.behavior.disable_nsfw_alert}
    />
    <Label for="disable-nsfw-alert">{$t("settings.behavior.disable_nsfw_alert")}</Label>
  </div>
</div>
