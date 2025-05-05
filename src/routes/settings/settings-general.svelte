<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import * as Select from "@/components/ui/select";
  import { APP_LANGUAGES, type AppLocale } from "@/constants";
  import { settings } from "@/stores";
  import { capitalize } from "@/utils";
  import { open as openDialog } from "@tauri-apps/plugin-dialog";
  import { locale, t } from "svelte-i18n";
  import { resetMode, setMode } from "mode-watcher";
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">{$t("settings.general:title")}</h1>

  <div class="flex flex-col gap-2">
    <Label for="downloads-path">{$t("settings.downloads_path")}</Label>
    <div class="flex gap-2">
      <Input
        type="text"
        name="downloads-path"
        placeholder={$t("settings.no_downloads_path")}
        value={$settings.downloadsPath}
        readonly
      />
      <Button
        variant="outline"
        onclick={async () => {
          const selected = await openDialog({ multiple: false, directory: true });
          if (!selected) return;
          $settings.downloadsPath = selected;
        }}>{$t("common.change")}</Button
      >
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <Label for="theme">{$t("settings.theme:title")}</Label>
    <Select.Root
      type="single"
      name="theme"
      bind:value={() => $settings.theme,
      value => {
        if (value === "system") resetMode();
        else setMode(value);
        $settings.theme = value;
      }}
    >
      <Select.Trigger class="w-[180px]">
        {capitalize($t("settings.theme." + $settings.theme))}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="light">{$t("settings.theme.light")}</Select.Item>
        <Select.Item value="dark">{$t("settings.theme.dark")}</Select.Item>
        <Select.Item value="system">{$t("settings.theme.system")}</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="flex flex-col gap-2">
    <Label for="language">{$t("settings.language")}</Label>
    <Select.Root
      type="single"
      name="language"
      bind:value={() => $settings.locale,
      value => {
        $settings.locale = value as AppLocale;
        locale.set(value);
      }}
    >
      <Select.Trigger class="w-[180px]"
        >{APP_LANGUAGES[$settings.locale].localizedName}</Select.Trigger
      >
      <Select.Content>
        {#each Object.entries(APP_LANGUAGES) as [locale, { name, localizedName }]}
          <Select.Item value={locale}>{name} ({localizedName})</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <h3 class="text-lg font-bold">{$t("settings.notifications:title")}</h3>

  <div class="flex items-center gap-2">
    <Checkbox
      id="when-download-complete"
      bind:checked={$settings.downloadNotificationsEnabled}
    />
    <Label for="when-download-complete">{$t("settings.download_notifications")}</Label>
  </div>
</div>
