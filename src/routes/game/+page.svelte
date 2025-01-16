<script lang="ts">
 import { page } from "$app/state";
 import * as Accordion from "@/components/ui/accordion";
 import { Button, buttonVariants } from "@/components/ui/button";
 import * as Dialog from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Separator } from "@/components/ui/separator";
 import { getSteamAppDetails, steamImageBuilder } from "@/services/steam";
 import { commands } from "@/specta-bindings";
 import { games } from "@/stores";
 import * as Steam from "@/types/steam.types";
 import { open } from "@tauri-apps/plugin-dialog";
 import {
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
 } from "date-fns";
 import CirclePause from "lucide-svelte/icons/circle-pause";
 import CirclePlay from "lucide-svelte/icons/circle-play";
 import CirclePlus from "lucide-svelte/icons/circle-plus";
 import Download from "lucide-svelte/icons/download";
 import File from "lucide-svelte/icons/file";
 import Settings from "lucide-svelte/icons/settings";
 import { t } from "svelte-i18n";

 const title = $derived<string>(page.url.searchParams.get("name")!);
 const remoteId = $derived<string>(page.url.searchParams.get("id")!);
 const localGame = $derived($games.find(game => game.remoteId == remoteId));
 const isPlayable = $derived<boolean>(
  !!localGame! && !!localGame.executablePath,
 );
 const noExecutable = $derived<boolean>(
  localGame! && !localGame?.executablePath!,
 );

 // TODO: Implement lazy loading with skeleton
 let appDetails = $state<Steam.AppDetails | null>(null);
 let selectedRequirements =
  $state<keyof Steam.AppDetails["pc_requirements"]>("minimum");

 $effect(() => {
  getSteamAppDetails(remoteId).then(data => (appDetails = data));
 });
</script>

<div class="flex flex-col">
 <img
  src={steamImageBuilder.libraryHero(remoteId)}
  alt={title}
  class="max-h-[300px] min-h-[300px] min-w-full object-cover xl:max-h-[350px]"
  fetchpriority="high"
 />
</div>

<div
 class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm"
>
 <div class="flex flex-col justify-center">
  {#if localGame?.running}
   <p>Playing now</p>
  {:else}
   {#if localGame?.playtimeInSeconds}
    <p>
     Played for {formatDuration(
      intervalToDuration({
       start: 0,
       end: localGame.playtimeInSeconds * 1000,
      }),
      { format: ["minutes", "hours"] },
     )}
    </p>
   {/if}
   <p>
    {localGame
     ? localGame.lastPlayedAt != 0
       ? `Last played ${formatDistanceToNow(localGame.lastPlayedAt!, { addSuffix: true })}`
       : `You haven't played ${title} yet`
     : `69 download options`}
   </p>
  {/if}
 </div>

 <div class="flex gap-4">
  <!-- For now disable the stop button, backend can't kill started process yet -->
  <Button
   variant="outline"
   disabled={localGame?.running}
   onclick={async () => {
    if (!localGame) {
     games.addGame({
      title,
      remoteId,
     });
    } else if (localGame.executablePath && !localGame.running) {
     await commands.runExecutable(localGame.executablePath!);
    } else if (localGame.running) {
     // Should close
    } else {
    }
   }}
  >
   {#if localGame?.running}
    <CirclePause />
   {:else if isPlayable}
    <CirclePlay />
   {:else if noExecutable}
    <Download />
   {:else}
    <CirclePlus />
   {/if}
   {localGame?.running
    ? "Stop"
    : isPlayable
      ? "Play"
      : noExecutable
        ? "Download"
        : "Add to Library"}</Button
  >
  {#if localGame}
   <Separator orientation="vertical" />
  {/if}
  <Dialog.Root>
   <Dialog.Trigger class={buttonVariants({ variant: "outline" })}
    ><Settings />{localGame
     ? "Options"
     : "Open download options"}</Dialog.Trigger
   >
   <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
     <Dialog.Title>{title}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <div class="space-y-4">
     <div class="space-y-2">
      <h2 class="text-xl font-bold text-muted-foreground">Executable</h2>
      <p class="text-sm text-muted-foreground">
       Path of the executable that will run when "Play" is clicked
      </p>
     </div>
     <div class="flex gap-2">
      <Input
       type="text"
       placeholder="No executable selected"
       value={localGame?.executablePath}
       readonly
      />
      <Button
       variant="outline"
       onclick={async () => {
        const executable = await open({
         filters: [
          {
           name: "Game executable",
           extensions: ["exe", "lnk"],
          },
         ],
        });
        if (!executable) return;
        games.updateGame(["remoteId", remoteId], game => ({
         ...game,
         executablePath: executable,
        }));
       }}
      >
       <File />
       Select
      </Button>
      {#if localGame?.executablePath}
       <Button
        variant="outline"
        onclick={() => {
         games.updateGame(["remoteId", remoteId], game => ({
          ...game,
          executablePath: "",
         }));
        }}>{$t("clear")}</Button
       >
      {/if}
     </div>
     <div class="space-y-2">
      <h2 class="text-xl font-bold text-muted-foreground">Downloads</h2>
      <p class="text-sm text-muted-foreground">
       Check out updates or other versions of this game
      </p>
     </div>
     <!-- For now disabled, since there's no download handler on the backend -->
     <Button variant="outline" disabled>Open download options</Button>

     <div class="space-y-2">
      <h2 class="text-xl font-bold text-muted-foreground">Danger Zone</h2>
      <p class="text-sm text-muted-foreground">
       Remove this game from your library or it's files
      </p>
     </div>

     <div class="flex gap-2">
      <Dialog.Root>
       <Dialog.Trigger class={buttonVariants({ variant: "destructive" })}
        >Remove from library</Dialog.Trigger
       >
       <Dialog.Content>
        <Dialog.Header>
         <Dialog.Title>Are you sure?</Dialog.Title>
         <Dialog.Description>
          This will remove {title} from your library
         </Dialog.Description>
        </Dialog.Header>
        <Separator />
        <div class="flex justify-end gap-2">
         <Dialog.Close
          class={buttonVariants({ variant: "outline" })}
          onclick={() => games.removeGame(remoteId)}>Confirm</Dialog.Close
         >
         <Dialog.Close class={buttonVariants()}>Cancel</Dialog.Close>
        </div>
       </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root>
       <Dialog.Trigger>
        {#snippet child({ props })}
         <Button
          variant="destructive"
          disabled={noExecutable}
          onclick={() => {
           // Should remove files
          }}
          {...props}>Remove files</Button
         >
        {/snippet}
       </Dialog.Trigger>
       <Dialog.Content>
        <Dialog.Header>
         <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
         <Dialog.Description>
          This will remove all the installation files for this game from your
          computer
         </Dialog.Description>
        </Dialog.Header>
        <Separator />
        <div class="flex justify-end gap-2">
         <Dialog.Close
          class={buttonVariants({ variant: "outline" })}
          disabled
          onclick={() => {
           // Should delete installation files
          }}>Confirm</Dialog.Close
         >
         <Dialog.Close class={buttonVariants()}>Cancel</Dialog.Close>
        </div>
       </Dialog.Content>
      </Dialog.Root>
     </div>
    </div>
   </Dialog.Content>
  </Dialog.Root>
 </div>
</div>

<div>
 <div class="flex flex-row">
  <div class="flex w-full flex-col">
   <div class="border-b border-r p-4 text-sm">
    <p>Released on {appDetails?.release_date.date}</p>
    <p>Published by {appDetails?.publishers.join(", ")}</p>
   </div>
   <div>
    <div class="border-r p-4">
     <div class="flex xl:justify-center">
      <article class="pb-[34px] xl:max-w-[750px]">
       {@html appDetails?.about_the_game}
      </article>
     </div>
    </div>
   </div>
  </div>
  <Accordion.Root
   type="multiple"
   class="min-w-[300px] max-w-[300px] xl:min-w-[400px] xl:max-w-[400px]"
  >
   <Accordion.Item value="system-requirements">
    <Accordion.Trigger class="px-4 py-6">System Requirements</Accordion.Trigger>
    <Accordion.Content>
     <div class="flex flex-row border-y text-sm">
      <button
       class={[
        "grow basis-1 py-2 transition-colors",
        { "bg-accent": selectedRequirements == "minimum" },
       ]}
       onclick={() => (selectedRequirements = "minimum")}>Minimum</button
      ><button
       class={[
        "grow basis-1 py-2 transition-colors",
        { "bg-accent": selectedRequirements == "recommended" },
       ]}
       onclick={() => (selectedRequirements = "recommended")}
       >Recommended</button
      >
     </div>
     <div class="p-4">
      {#if appDetails?.pc_requirements}
       {@html appDetails?.pc_requirements[selectedRequirements] ??
        `No ${selectedRequirements} requirements`}
      {/if}
     </div>
    </Accordion.Content>
   </Accordion.Item>
  </Accordion.Root>
 </div>
</div>

<style>
 :global(article) :global(ul) {
  list-style: disc;
  padding-left: 32px;
  padding-top: 8px;
 }

 :global(article) :global(img) {
  border-radius: 4px;
  min-width: 100%;
  margin-top: 8px;
 }

 :global(article) :global(h2) {
  font-size: 22px;
  font-weight: 500;
  margin: 16px 0 0;
 }

 :global(article) :global(p):not(:first-child) {
  margin: 8px 0;
 }
</style>
