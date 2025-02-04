<script lang="ts">
  import * as Accordion from "@/components/ui/accordion";
  import { getGameContext } from "@/context";
  import * as Steam from "@/types/steam.types";
  import { t } from "svelte-i18n";

  const gameContext = getGameContext();
  const { details } = $derived(gameContext);
  let selectedRequirement = $state<keyof Steam.AppDetails["pc_requirements"]>("minimum");
</script>

<Accordion.Root
  type="multiple"
  class="min-w-[300px] max-w-[300px] xl:min-w-[400px] xl:max-w-[400px]"
>
  <Accordion.Item value="system-requirements">
    <Accordion.Trigger class="px-4 py-6"
      >{$t("game.system_requirements")}</Accordion.Trigger
    >
    <Accordion.Content>
      <div class="flex flex-row border-y text-sm">
        <button
          class={[
            "flex-1 py-2 transition-colors",
            { "bg-accent": selectedRequirement === "minimum" },
          ]}
          onclick={() => (selectedRequirement = "minimum")}
          >{$t("game.system_requirements:minimum")}</button
        ><button
          class={[
            "flex-1 py-2 transition-colors",
            { "bg-accent": selectedRequirement === "recommended" },
          ]}
          onclick={() => (selectedRequirement = "recommended")}
          >{$t("game.system_requirements:recommended")}</button
        >
      </div>
      <div class="p-4">
        {#if details?.pc_requirements}
          {@html details?.pc_requirements[selectedRequirement] ??
            $t("game.no_system_requirements")}
        {/if}
      </div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
