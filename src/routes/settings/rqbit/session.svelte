<script lang="ts">
  import { Button } from "@/components/ui/button";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { settings } from "@/stores";
  import { open as openDialog } from "@tauri-apps/plugin-dialog";
  import { t } from "svelte-i18n";
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2">
    <Checkbox
      id="enable-persistence"
      bind:checked={() => !$settings.rqbit.persistence.disable!,
      checked => {
        $settings.rqbit.persistence.disable = !checked;
      }}
    />
    <Label for="enable-persistence">Enable Persistence</Label>
  </div>
  <p class="text-sm text-muted-foreground">
    If you disable session persistence, rqbit won't remember the torrents you had before
    restart
  </p>
</div>

<div class="flex flex-col gap-2">
  <Label for="persistence-folder">Persistence folder</Label>
  <div class="flex gap-2">
    <Input
      type="text"
      name="persistence-folder"
      value={$settings.rqbit.persistence.folder}
      readonly
    />
    <Button
      variant="outline"
      onclick={async () => {
        const selected = await openDialog({
          multiple: false,
          directory: true,
          defaultPath: $settings.rqbit.persistence.folder,
        });
        if (!selected) return;
        $settings.rqbit.persistence.folder = selected;
      }}>{$t("common.change")}</Button
    >
  </div>
</div>

<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2">
    <Checkbox
      id="enable-fast-resume"
      bind:checked={() => $settings.rqbit.persistence.fastresume!,
      checked => {
        $settings.rqbit.persistence.fastresume = checked;
      }}
    />
    <Label for="enable-fast-resume">Enable fast resume (experimental)</Label>
  </div>
  <p class="text-sm text-muted-foreground">
    If enabled, restarting will not rehash torrents, and thus will be faster. You should
    not modify the downloaded files in any way if you use that
  </p>
</div>
