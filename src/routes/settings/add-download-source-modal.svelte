<script lang="ts" module>
  import { z } from "zod";

  const schema = z.object({
    url: z.string().url().nonempty(),
  });
</script>

<script lang="ts">
  import { Button, buttonVariants } from "@/components/ui/button";
  import * as Dialog from "@/components/ui/dialog";
  import * as Form from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { Separator } from "@/components/ui/separator";
  import { downloadSourcesTable } from "@/database";
  import {
    importDownloadSource,
    validateDownloadSource,
  } from "@/services/download-sources";
  import type { DownloadSourceValidationResult } from "@/types";
  import { t } from "svelte-i18n";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms/client";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";

  let validationResult = $state.raw<DownloadSourceValidationResult | null>(null);
  let isLoading = $state(false);
  let open = $state(false);

  const form = superForm(
    { url: "" },
    {
      SPA: true,
      validators: zodClient(schema),
      onSubmit: async () => {
        const existingDownloadSource = await downloadSourcesTable
          .where({ url: $formData.url })
          .first();

        if (existingDownloadSource) {
          $errors.url = [$t("settings.sources.already_added")];
          return;
        }

        if ($errors.url && $errors.url.length > 0) return;

        try {
          validationResult = await validateDownloadSource($formData.url);
        } catch {
          $errors.url = [$t("settings.sources.insert_valid_url")];
        }
      },
    }
  );

  const { form: formData, errors, enhance } = form;
</script>

<Dialog.Root
  bind:open
  onOpenChange={open => {
    if (!open) validationResult = null;
  }}
>
  <Dialog.Trigger class={buttonVariants({ variant: "outline" })}
    ><CirclePlus />{$t("settings.sources.add_source")}</Dialog.Trigger
  >
  <Dialog.Content
    interactOutsideBehavior={isLoading ? "ignore" : "close"}
    escapeKeydownBehavior="ignore"
    hideCloseButton={isLoading}
  >
    <Dialog.Header>
      <Dialog.Title>{$t("settings.sources.add_source")}</Dialog.Title>
      <Dialog.Description>{$t("settings.sources:description")}</Dialog.Description>
    </Dialog.Header>
    <Separator />
    <div class="space-y-4">
      <form method="POST" use:enhance>
        <Form.Field {form} name="url">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{$t("settings.sources.download_source_url")}</Form.Label>
              <div class="flex gap-2">
                <Input
                  placeholder={$t("settings.sources.insert_json_url")}
                  bind:value={$formData.url}
                  autocomplete="off"
                  {...props}
                />
                <Form.Button variant="outline" disabled={!!validationResult}
                  >{$t("settings.sources.validate")}</Form.Button
                >
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </form>

      {#if validationResult}
        <div class="flex items-center justify-between">
          <div>
            <p>{validationResult.name}</p>
            <small
              >{$t("settings.sources.found_download_options", {
                values: { count: validationResult.downloadCount },
              })}</small
            >
          </div>
          <Button
            disabled={isLoading}
            onclick={async () => {
              isLoading = true;
              await importDownloadSource($formData.url);
              isLoading = false;
              open = false;
              validationResult = null;
            }}
          >
            {#if isLoading}
              <RefreshCcw class={isLoading ? "animate-spin" : ""} />
            {/if}
            {$t("settings.sources.import")}</Button
          >
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
