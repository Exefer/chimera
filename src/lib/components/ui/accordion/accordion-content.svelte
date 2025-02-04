<script lang="ts">
  import { cn } from "@/utils";
  import { Accordion as AccordionPrimitive, type WithoutChild } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
  bind:ref
  class={cn(
    "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    className
  )}
  {...restProps}
>
  <div class="pb-4 pt-0">
    {@render children?.()}
  </div>
</AccordionPrimitive.Content>
