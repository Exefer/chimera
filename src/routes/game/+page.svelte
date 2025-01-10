<script lang="ts">
 import { page } from "$app/state";
 import * as Accordion from "@/components/ui/accordion";
 import { Button, buttonVariants } from "@/components/ui/button";
 import * as Dialog from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Separator } from "@/components/ui/separator";
 import { getSteamAppDetails } from "@/steam/api";
 import { steamImageBuilder } from "@/steam/url-builders";
 import { gamesStore } from "@/store/games.store";
 import * as Steam from "@/types/steam.types";
 import { open } from "@tauri-apps/plugin-dialog";
 import { formatDistanceToNow } from "date-fns";
 import CirclePlay from "lucide-svelte/icons/circle-play";
 import CirclePlus from "lucide-svelte/icons/circle-plus";
 import Download from "lucide-svelte/icons/download";
 import File from "lucide-svelte/icons/file";
 import Settings from "lucide-svelte/icons/settings";
 import { onMount } from "svelte";
 import { toast } from "svelte-sonner";

 let appDetails = $state<Steam.AppDetails>();
 let selectedRequirements =
  $state<keyof Steam.AppDetails["pc_requirements"]>("minimum");

 const remoteId = +page.url.searchParams.get("id")!;

 onMount(async () => {
  appDetails = await getSteamAppDetails(remoteId);
 });

 const localGame = $derived(
  $gamesStore.find(game => game.remoteId == remoteId),
 );
 $inspect(localGame);
</script>

<div class="flex flex-col">
 <img
  src={steamImageBuilder.libraryHero(remoteId)}
  alt={appDetails?.name}
  class="max-h-[300px] min-h-[300px] min-w-full object-cover xl:max-h-[350px]"
  fetchpriority="high"
 />
</div>

<div
 class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm"
>
 <div>
  <p>
   {localGame
    ? `Played for ${localGame.playtimeInSeconds} minutes`
    : `Updated ${new Intl.DateTimeFormat("en-GB").format(Date.now())}`}
  </p>
  <p>
   {localGame
    ? localGame.lastPlayedAt
      ? `Last played ${formatDistanceToNow(localGame.lastPlayedAt!)}`
      : `You haven't played ${appDetails?.name} yet`
    : `69 download options`}
  </p>
 </div>

 <div class="flex gap-4">
  <Button
   variant="outline"
   onclick={() => {
    if (!localGame)
     gamesStore.addGame({
      title: appDetails?.name!,
      remoteId,
     });
    else {
     toast("Should open game...");
    }
   }}
  >
   {#if localGame && localGame.executablePath}
    <CirclePlay />
   {:else if localGame && !localGame?.executablePath}
    <Download />
   {:else}
    <CirclePlus />
   {/if}
   {localGame ? "Play" : "Add to Library"}</Button
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
   <Dialog.Content>
    <Dialog.Header>
     <Dialog.Title>{appDetails?.name}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <div class="space-y-4">
     <div class="space-y-2">
      <h2 class="text-xl text-muted-foreground">Executable</h2>
      <p class="text-sm text-muted-foreground">
       Path of the executable that will run when "Play" is clicked
      </p>
     </div>
     <div class="flex gap-4">
      <Input type="text" readonly />
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

        gamesStore.updateGame(remoteId, { executablePath: executable });
       }}
      >
       <File />
       Select
      </Button>
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
      <article class="xl:max-w-[750px]">
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
      {:else}
       <p>Loading...</p>
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
