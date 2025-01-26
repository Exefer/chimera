<script lang="ts" module>
 import { z } from "zod";

 export const schema = z.object({
  url: z.string().url("Please enter a valid URL"),
 });

 export type FormSchema = typeof schema;
</script>

<script lang="ts">
 import { Button, buttonVariants } from "@/components/ui/button";
 import * as Dialog from "@/components/ui/dialog";
 import * as Form from "@/components/ui/form";
 import { Input } from "@/components/ui/input";
 import { Separator } from "@/components/ui/separator";
 import { sources } from "@/stores";
 import * as Types from "@/types";
 import CircleMinus from "lucide-svelte/icons/circle-minus";
 import CirclePlus from "lucide-svelte/icons/circle-plus";
 import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
 import { fade, slide } from "svelte/transition";
 import { zodClient } from "sveltekit-superforms/adapters";
 import { superForm } from "sveltekit-superforms/client";

 let temporarySource = $state<Types.Source | null>(null);

 const form = superForm(
  { url: "" },
  {
   SPA: true,
   validators: zodClient(schema),
   onSubmit: async () => {
    const url = $formData.url;
    if ($sources.find(source => source.url == url)) {
     $errors.url = ["Source already added!"];
     return;
    }
    fetch(url)
     .then(response => response.json())
     .then(source => {
      temporarySource = { ...source, url };
     })
     .catch(() => {
      $errors.url = ["Not a valid JSON file"];
     });
   },
  },
 );
 const { form: formData, errors, enhance } = form;
</script>

<h1 class="text-2xl font-bold">Sources</h1>

<p>
 Chimera will fetch the download links from these sources. The source URL must be a direct
 link to a .json file containing the download links.
</p>

<div class="flex justify-between">
 <Button
  variant="outline"
  disabled={$sources.length == 0}
  onclick={async () => {
   await sources.refreshSources();
  }}><RefreshCcw />Sync Sources</Button
 >
 <Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: "outline" })}
   ><CirclePlus />Add source</Dialog.Trigger
  >
  <Dialog.Content>
   <Dialog.Header>
    <Dialog.Title>Add Source</Dialog.Title>
    <Dialog.Description>Insert the URL of the .json file</Dialog.Description>
   </Dialog.Header>
   <Separator />
   <div class="space-y-4">
    <form method="POST" use:enhance>
     <Form.Field {form} name="url">
      <Form.Control>
       {#snippet children({ props })}
        <Form.Label>Download Source URL</Form.Label>
        <div class="flex gap-2">
         <Input {...props} bind:value={$formData.url} autocomplete="off" />
         <Form.Button variant="outline">Validate</Form.Button>
        </div>
       {/snippet}
      </Form.Control>
      <Form.FieldErrors />
     </Form.Field>
    </form>

    {#if temporarySource}
     <div class="flex items-center justify-between">
      <div>
       <p>{temporarySource.name}</p>
       <small>Found {temporarySource.downloads.length} download options</small>
      </div>
      <Dialog.Close
       class={buttonVariants()}
       onclick={() => {
        sources.addSource(temporarySource!);
        temporarySource = null;
       }}>Import</Dialog.Close
      >
     </div>
    {/if}
   </div>
  </Dialog.Content>
 </Dialog.Root>
</div>

<ul class="space-y-4">
 {#each $sources as source, index (source.name)}
  <li class="space-y-2 rounded-lg border p-4 shadow-sm" out:fade in:slide>
   <h1 class="text-lg font-bold">{source.name}</h1>
   <small>{source.downloads.length} download options</small>
   <p class="text-sm text-muted-foreground">Download Source URL</p>
   <div class="flex justify-between gap-4">
    <Input value={source.url} readonly />
    <Button
     variant="outline"
     onclick={() => {
      sources.removeSource(index);
     }}><CircleMinus />Remove</Button
    >
   </div>
  </li>
 {/each}
</ul>
