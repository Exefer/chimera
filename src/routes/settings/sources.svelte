<script lang="ts" module>
 import { z } from "zod";

 export const schema = z.object({
  url: z.string().url(),
 });

 export type FormSchema = typeof schema;
</script>

<script lang="ts">
 import { Button, buttonVariants } from "@/components/ui/button";
 import * as Dialog from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Separator } from "@/components/ui/separator";
 import { sources } from "@/stores";
 import * as Types from "@/types";
 import { validator } from "@felte/validator-zod";
 import { createForm } from "felte";
 import CircleMinus from "lucide-svelte/icons/circle-minus";
 import CirclePlus from "lucide-svelte/icons/circle-plus";
 import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
 import { toast } from "svelte-sonner";
 import { slide } from "svelte/transition";

 let temporarySource = $state<Types.Source | null>(null);

 const { form, errors } = createForm<z.infer<FormSchema>>({
  onSubmit: async values => {
   const response = await fetch(values.url);

   if (response.ok) {
    if ($sources.find(source => source.url == values.url)) {
     throw "Source already added!";
    }
    return await response
     .json()
     .then(source => ({ ...source, url: values.url }))
     .catch(() => {
      throw "Not a valid JSON file";
     });
   }
  },
  onSuccess: response => {
   temporarySource = response as Types.Source;
  },
  onError(error, context) {
   context.setErrors(
    "url",
    error instanceof Error ? error.message : (error as string),
   );
  },
  extend: [validator({ schema })],
 });
</script>

<h1 class="text-2xl font-bold">Sources</h1>

<p>
 Chimera will fetch the download links from these sources. The source URL must
 be a direct link to a .json file containing the download links.
</p>

<div class="flex justify-between">
 <Button
  variant="outline"
  disabled={!$sources.length}
  onclick={async () => {
   await sources.refreshSources();
   toast.success("All download sources are synced!");
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
    <form class="space-y-2" use:form>
     <Label class="text-muted-foreground" for="url">Download Source URL</Label>
     <div class="flex gap-4">
      <Input type="url" name="url" autocomplete="off" />
      <Button type="submit" variant="outline">Validate</Button>
     </div>
     {#if $errors.url}
      <span class="mt-1 text-sm text-red-500">{$errors.url}</span>
     {/if}
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
        toast.success("Added download source");
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
  <li class="space-y-2 rounded-lg border p-4 shadow-sm" out:slide>
   <h1 class="text-lg font-bold">{source.name}</h1>
   <small>{source.downloads.length} download options</small>
   <p class="text-sm text-muted-foreground">Download Source URL</p>
   <div class="flex justify-between gap-4">
    <Input value={source.url} readonly />
    <Button
     variant="outline"
     onclick={() => {
      sources.removeSource(index);
      toast.success("Removed download source");
     }}><CircleMinus />Remove</Button
    >
   </div>
  </li>
 {/each}
</ul>
