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
      id="enable-dht"
      bind:checked={() => !$settings.rqbit.dht.disable!,
      checked => {
        $settings.rqbit.dht.disable = !checked;
      }}
    />
    <Label for="enable-dht">Enable DHT</Label>
  </div>
  <p class="text-sm text-muted-foreground">
    DHT is required to read magnet links. There's no good reason to disable it, unles you
    know what you're doing
  </p>
</div>
<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2">
    <Checkbox
      id="enable-dht"
      bind:checked={() => !$settings.rqbit.dht.disable!,
      checked => {
        $settings.rqbit.dht.disable = !checked;
      }}
    />
    <Label for="enable-dht">Enable DHT Persistence</Label>
  </div>
  <p class="text-sm text-muted-foreground">
    Enable to store DHT state in a file periodically. If disabled, DHT will bootstrap from
    scratch on restart
  </p>
</div>

<div class="flex flex-col gap-2">
  <Label for="persistence-file">Persistence file</Label>
  <div class="flex gap-2">
    <Input
      type="text"
      name="persistence-file"
      value={$settings.rqbit.dht.persistence_file}
      readonly
    />
    <Button
      variant="outline"
      onclick={async () => {
        const selected = await openDialog({
          filters: [
            {
              name: "DHT Persistence file",
              extensions: ["json"],
            },
          ],
        });
        if (!selected) return;
        $settings.rqbit.dht.persistence_file = selected;
      }}>{$t("common.change")}</Button
    >
  </div>
  <p class="text-sm text-muted-foreground">The file to store the DHT state into</p>
</div>
