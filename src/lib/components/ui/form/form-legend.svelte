<script lang="ts">
  import { cn } from "@/utils";
  import type { WithoutChild } from "bits-ui";
  import * as FormPrimitive from "formsnap";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChild<FormPrimitive.LegendProps> = $props();
</script>

<FormPrimitive.Legend
  bind:ref
  class={cn(
    "text-sm font-medium leading-none data-[fs-error]:text-destructive",
    className
  )}
  {...restProps}
/>
