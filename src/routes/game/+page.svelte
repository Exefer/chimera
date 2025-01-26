<script lang="ts">
 import { page } from "$app/state";
 import * as Accordion from "@/components/ui/accordion";
 import { Button, buttonVariants } from "@/components/ui/button";
 import * as Dialog from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Separator } from "@/components/ui/separator";
 import { DOWNLOADER_NAMES } from "@/constants/";
 import { getSteamAppDetails, steamImageBuilder } from "@/services/steam";
 import { commands } from "@/specta-bindings";
 import { appsByLetter, downloads, games, settings, sources } from "@/stores";
 import * as Types from "@/types";
 import * as Steam from "@/types/steam.types";
 import { formatTitle, getDownloaderFromUrl } from "@/utils";
 import { open } from "@tauri-apps/plugin-dialog";
 import { revealItemInDir } from "@tauri-apps/plugin-opener";
 import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
 import CircleCheck from "lucide-svelte/icons/circle-check-big";
 import CirclePause from "lucide-svelte/icons/circle-pause";
 import CirclePlay from "lucide-svelte/icons/circle-play";
 import CirclePlus from "lucide-svelte/icons/circle-plus";
 import Download from "lucide-svelte/icons/download";
 import File from "lucide-svelte/icons/file";
 import Settings from "lucide-svelte/icons/settings";
 import { t } from "svelte-i18n";
 import { toast } from "svelte-sonner";

 const title = $derived<string>(page.url.searchParams.get("title")!);
 const remoteId = $derived<string>(page.url.searchParams.get("id")!);
 const localGame = $derived($games.find(game => game.remoteId == remoteId));
 const isPlayable = $derived<boolean>(localGame! && !!localGame.executablePath);
 const noExecutable = $derived<boolean>(localGame! && !localGame?.executablePath);

 let downloadsFolder = $state<string>($settings.downloadsPath);
 let downloadOptionsVisible = $state<boolean>(false);
 let gameOptionsVisible = $state<boolean>(false);

 let selectedPackDownload = $state<Types.GamePack | null>(null);
 let selectedUri = $state<string | null>(null);

 $effect(() => {
  if (selectedPackDownload?.uris?.length! > 0) {
   selectedUri = selectedPackDownload?.uris[0]!;
  } else {
   selectedUri = null;
  }
 });

 let packFilter = $state<string>("");
 // TODO: Implement lazy loading with skeleton
 let appDetails = $state<Steam.AppDetails | null>(null);
 let selectedRequirements = $state<keyof Steam.AppDetails["pc_requirements"]>("minimum");

 $effect(() => {
  getSteamAppDetails(remoteId).then(data => (appDetails = data));

  return () => {
   appDetails = null;
  };
 });
 /* TESTING: proof of concept
  * Can throw error if source is not found
  */
 const source = $sources[0];

 const remoteIdsOnSource = new Set<string>();
 const results = source.downloads.map(download => {
  const formattedTitle = formatTitle(download.title);
  const [firstLetter] = formattedTitle;
  const gamesInSteam = ($appsByLetter[firstLetter] || []).filter(app =>
   formattedTitle.startsWith(app.name),
  );

  gamesInSteam.forEach(game => remoteIdsOnSource.add(String(game.id)));

  return {
   ...download,
   packer: source.name,
   remoteIds: gamesInSteam.map(app => String(app.id)),
  };
 });
 const packs = results.filter(result => result.remoteIds.includes(remoteId));
 /* END OF TESTING */
</script>

<div class="flex flex-col">
 <img
  src={steamImageBuilder.libraryHero(remoteId)}
  alt={title}
  class="max-h-[300px] min-h-[300px] min-w-full object-cover xl:max-h-[350px]"
  fetchpriority="high"
 />
</div>

<div class="sticky top-[72px] flex justify-between border-y bg-background p-4 text-sm">
 <div class="flex flex-col justify-center">
  {#if !localGame && packs.length > 0}
   {@const [updatedAt] = packs
    .map(pack => new Date(pack.uploadDate))
    .sort((a, b) => b.valueOf() - a.valueOf())}
   <p>Updated {updatedAt.toLocaleDateString()}</p>
  {/if}

  {#if localGame?.running}
   <p>Playing now</p>
  {:else if localGame?.playtimeInSeconds}
   <p>
    Played for {formatDuration(
     intervalToDuration({
      start: 0,
      end: localGame.playtimeInSeconds * 1000,
     }),
     { format: ["hours", "minutes", "seconds"] },
    )}
   </p>
  {/if}

  <p>
   {#if !localGame}
    {packs.length > 0 ? `${packs.length} download options` : "No downloads available"}
   {:else if localGame.lastPlayedAt}
    Last played {formatDistanceToNow(localGame.lastPlayedAt, { addSuffix: true })}
   {:else}
    You haven't played {title} yet
   {/if}
  </p>
 </div>

 <div class="flex gap-4">
  <!-- For now disable the stop button, backend can't kill started process yet -->
  <Button
   variant="outline"
   disabled={localGame?.running || (localGame && packs.length == 0)}
   onclick={async () => {
    if (!localGame) {
     games.addGame({ title, remoteId });
    } else if (localGame.executablePath && !localGame.running) {
     await commands.runExecutable(localGame.executablePath);
    } else if (noExecutable) {
     downloadOptionsVisible = true;
    } else if (localGame.running) {
     // Should close
    }
   }}
  >
   {#if localGame?.running}
    <CirclePause />
    Stop
   {:else if isPlayable}
    <CirclePlay />
    Play
   {:else if noExecutable}
    <Download />
    Download
   {:else}
    <CirclePlus />
    Add to Library
   {/if}
  </Button>
  {#if localGame}
   <Separator orientation="vertical" />
   <Button
    variant="outline"
    onclick={() => {
     if (localGame) {
      gameOptionsVisible = true;
     } else {
      downloadOptionsVisible = true;
     }
    }}
   >
    {#if localGame}
     <Settings />
     Options
    {:else}
     Open download options
    {/if}
   </Button>
  {/if}
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
       onclick={() => (selectedRequirements = "recommended")}>Recommended</button
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

<Dialog.Root bind:open={gameOptionsVisible}>
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
   <div>
    <Button
     variant="outline"
     disabled={noExecutable}
     onclick={() => {
      revealItemInDir(localGame?.executablePath!);
     }}>Open folder</Button
    >
    <Button
     variant="outline"
     disabled={noExecutable}
     onclick={async () => {
      const result = await commands.createShortcut(localGame?.executablePath!);
      if (result.status == "ok") {
       toast.success("Shortcut created successfully");
      } else {
       toast.error("Failed to create shortcut");
      }
     }}>Create desktop shortcut</Button
    >
   </div>
   <div class="space-y-2">
    <h2 class="text-xl font-bold text-muted-foreground">Downloads</h2>
    <p class="text-sm text-muted-foreground">
     Check out updates or other versions of this game
    </p>
   </div>
   <!-- For now disabled, since there's no download handler on the backend -->
   <Button
    variant="outline"
    disabled={packs.length == 0}
    onclick={() => {
     downloadOptionsVisible = true;
    }}>Open download options</Button
   >

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
        This will remove all the installation files for this game from your computer
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

{#if packs.length > 0}
 <Dialog.Root bind:open={downloadOptionsVisible}>
  <Dialog.Trigger>Download options</Dialog.Trigger>
  <Dialog.Content>
   <Dialog.Header>
    <Dialog.Title>Download options</Dialog.Title>
   </Dialog.Header>

   <Separator />
   <Input type="text" bind:value={packFilter} placeholder="Filter packs" />
   <div class="flex flex-col gap-2">
    {#each packs.filter(pack => pack.title.includes(packFilter.toLowerCase()) || pack.packer.includes(packFilter.toLowerCase())) as pack, index}
     <button
      class="flex flex-col gap-2 rounded-md bg-primary-foreground p-4 text-left hover:bg-primary-foreground/80"
      onclick={() => {
       selectedPackDownload = pack;
      }}
     >
      <p class="text-wrap text-sm">{pack.title}</p>
      <p class="text-xs text-muted-foreground">
       {pack.fileSize} - {pack.packer} - {new Date(pack.uploadDate).toLocaleDateString()}
      </p>
     </button>
    {/each}
   </div>
  </Dialog.Content>
 </Dialog.Root>

 <Dialog.Root
  open={selectedPackDownload != null}
  onOpenChange={open => !open && (selectedPackDownload = null)}
 >
  <Dialog.Content>
   <Dialog.Header>
    <Dialog.Title>Download settings</Dialog.Title>
    <Dialog.Description>Choose the pack you want to download</Dialog.Description>
   </Dialog.Header>
   <Separator />
   <div class="flex flex-col gap-4">
    <div class="space-y-2">
     <p class="text-sm text-muted-foreground">Downloader</p>
     <div class="flex flex-row gap-2">
      {#each selectedPackDownload?.uris! as uri}
       {@const downloader = getDownloaderFromUrl(uri)}

       <Button
        variant={selectedUri == uri ? "default" : "outline"}
        class="flex-1"
        disabled={downloader == Types.Downloader.RealDebrid}
        onclick={() => {
         selectedUri = uri;
        }}
       >
        {#if selectedUri == uri}
         <CircleCheck />
        {/if}
        {DOWNLOADER_NAMES[downloader]}
       </Button>
      {/each}
     </div>
    </div>
    <div class="space-y-2">
     <p class="text-sm text-muted-foreground">Download path</p>
     <div class="flex flex-row gap-2">
      <Input type="text" value={downloadsFolder} placeholder="Download path" readonly />
      <Button
       variant="outline"
       onclick={async () => {
        const folder = await open({
         directory: true,
         multiple: false,
        });
        if (!folder) return;
        downloadsFolder = folder;
       }}>Select</Button
      >
     </div>
     <p class="text-xs text-muted-foreground">
      To change the default folder, go to the
      <a class="text-primary underline" href="/settings">Settings</a> page
     </p>
    </div>
    <Button
     disabled={!selectedUri || !downloadsFolder}
     onclick={() => {
      downloads.addDownload(
       selectedUri!,
       remoteId,
       selectedPackDownload?.title!,
       downloadsFolder,
      );
      selectedPackDownload = null;
      downloadOptionsVisible = false;
     }}><Download />Download now</Button
    >
   </div>
  </Dialog.Content>
 </Dialog.Root>
{/if}

<style>
 :global(article ul) {
  list-style: disc;
  padding-left: 32px;
  padding-top: 8px;
 }

 :global(article img) {
  border-radius: 4px;
  min-width: 100%;
  margin-top: 8px;
 }

 :global(article h2) {
  font-size: 22px;
  font-weight: 500;
  margin: 16px 0 0;
 }

 :global(article p:not(:first-child)) {
  margin: 8px 0;
 }
</style>
