<script lang="ts">
  import * as Button from "@/components/ui/button";

  let { ref = $bindable(null), ...restProps }: Button.Props = $props();
</script>

<Button.Root bind:ref type="submit" {...restProps} />
