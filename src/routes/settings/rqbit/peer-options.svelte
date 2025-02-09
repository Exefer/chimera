<script lang="ts">
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { settings } from "@/stores";
</script>

<div class="flex flex-col gap-2">
  <Label for="peer-connection-timeout">Connection timeout (seconds)</Label>
  <Input
    type="number"
    name="peer-connection-timeout"
    bind:value={$settings.rqbit.peer_opts.connect_timeout}
  />
  <p class="text-sm text-muted-foreground">
    How much to wait for outgoing connections to connect. Default is low to prefer faster
    peers
  </p>
</div>
<div class="flex flex-col gap-2">
  <Label for="read-write-timeout">Read/Write timeout (seconds)</Label>
  <Input
    type="number"
    name="read-write-timeout"
    bind:value={$settings.rqbit.peer_opts.read_write_timeout}
  />
  <p class="text-sm text-muted-foreground">Peer socket read/write timeout</p>
</div>
