<script lang="ts" module>
  import { type VariantProps, tv } from "tailwind-variants";

  export const badgeVariants = tv({
    base: "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        transparent: "bg-transparent",
      },
      position: {
        "top-left": "left-2 top-2",
        "top-right": "right-2 top-2",
        "bottom-left": "bottom-2 left-2",
        "bottom-right": "bottom-2 right-2",
      },
    },
    compoundVariants: [
      {
        position: ["top-left", "top-right", "bottom-left", "bottom-right"],
        class: "absolute",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  });

  export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  export type BadgePosition = VariantProps<typeof badgeVariants>["position"];
</script>

<script lang="ts">
  import { cn } from "@/utils";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { WithElementRef } from "bits-ui";

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = "default",
    position,
    children,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant;
    position?: BadgePosition;
  } = $props();
</script>

<svelte:element
  this={href ? "a" : "span"}
  bind:this={ref}
  {href}
  class={cn(badgeVariants({ variant, position }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
