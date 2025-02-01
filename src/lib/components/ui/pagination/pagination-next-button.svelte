<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import { Pagination as PaginationPrimitive } from "bits-ui";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import { t } from "svelte-i18n";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: PaginationPrimitive.NextButtonProps = $props();
</script>

{#snippet Fallback()}
  <span>{$t("search.next_page")}</span>
  <ChevronRight class="size-4" />
{/snippet}

<PaginationPrimitive.NextButton
  bind:ref
  class={cn(
    buttonVariants({
      variant: "ghost",
      class: "gap-1 pr-2.5",
    }),
    className
  )}
  children={children || Fallback}
  {...restProps}
/>
