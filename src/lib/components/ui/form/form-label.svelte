<script lang="ts">
  import { Label } from "@/components/ui/label";
  import { cn } from "@/utils";
  import type { WithoutChild } from "bits-ui";
  import * as FormPrimitive from "formsnap";

  let {
    ref = $bindable(null),
    children,
    class: className,
    ...restProps
  }: WithoutChild<FormPrimitive.LabelProps> = $props();
</script>

<FormPrimitive.Label {...restProps} bind:ref>
  {#snippet child({ props })}
    <Label {...props} class={cn("data-[fs-error]:text-destructive", className)}>
      {@render children?.()}
    </Label>
  {/snippet}
</FormPrimitive.Label>
