<script lang="ts">
  import { Separator } from "@/components/ui/separator";
  import { cn } from "@/utils";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ComponentProps<typeof Separator> = $props();
</script>

<Separator
  bind:ref
  data-sidebar="separator"
  class={cn("mx-2 w-auto bg-sidebar-border", className)}
  {...restProps}
/>
