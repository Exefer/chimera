<script lang="ts" module>
  import { z } from "zod";

  const schema = z.object({
    url: z.string().url("Please enter a valid URL"),
  });
</script>

<script lang="ts">
  import { Button, buttonVariants } from "@ui/button";
  import * as Dialog from "@ui/dialog";
  import * as Form from "@ui/form";
  import { Input } from "@ui/input";
  import { Separator } from "@ui/separator";
  import { importDownloadSource } from "@/services/sources";
  import * as Types from "@/types";
  import { fetch } from "@tauri-apps/plugin-http";
  import { t } from "svelte-i18n";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms/client";
  import CirclePlus from "lucide-svelte/icons/circle-plus";

  interface AddDownloadSourceModalProps {
    hasDownloadSourceUrl: (source: string) => boolean;
  }

  let { hasDownloadSourceUrl }: AddDownloadSourceModalProps = $props();

  const form = superForm(
    { url: "" },
    {
      SPA: true,
      validators: zodClient(schema),
      onSubmit: async () => {
        const url = $formData.url;
        if (hasDownloadSourceUrl(url)) {
          $errors.url = [$t("settings.sources.already_added")];
          return;
        }

        fetch(url)
          .then(response => {
            etag = response.headers.get("etag");
            return response.json();
          })
          .then(data => {
            source = { ...data, url };
          })
          .catch(() => {
            $errors.url = [$t("settings.sources.invalid_json_url")];
          });
      },
    }
  );

  let source = $state.raw<Types.Source | null>(null);
  let etag = $state<string | null>(null);
  let isLoading = $state(false);
  let open = $state(false);

  const { form: formData, errors, enhance } = form;
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class={buttonVariants({ variant: "outline" })}
    ><CirclePlus />{$t("settings.sources.add_source")}</Dialog.Trigger
  >
  <Dialog.Content>
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
                <Form.Button variant="outline"
                  >{$t("settings.sources.validate")}</Form.Button
                >
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </form>

      {#if source}
        <div class="flex items-center justify-between">
          <div>
            <p>{source.name}</p>
            <small
              >{$t("settings.sources.found_download_options", {
                values: { count: source.downloads.length },
              })}</small
            >
          </div>
          <Button
            disabled={isLoading}
            onclick={async () => {
              isLoading = true;
              await importDownloadSource(source!, etag!);
              isLoading = false;
              open = false;
              source = null;
              etag = null;
            }}>{$t("settings.sources.import")}</Button
          >
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
