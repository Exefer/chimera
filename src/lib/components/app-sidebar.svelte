<script lang="ts">
 import { page } from "$app/state";
 import { Input } from "@/components/ui/input";
 import * as Sidebar from "@/components/ui/sidebar";
 import { gamesStore } from "@/store/games.store";
 import Download from "lucide-svelte/icons/download";
 import House from "lucide-svelte/icons/house";
 import Settings from "lucide-svelte/icons/settings";

 const items = [
  {
   title: "Home",
   href: "/",
   icon: House,
  },
  {
   title: "Downloads",
   href: "/downloads",
   icon: Download,
  },
  {
   title: "Settings",
   href: "/settings",
   icon: Settings,
  },
 ];

 let search = $state<string>("");
</script>

<Sidebar.Root>
 <Sidebar.Content>
  <Sidebar.Group>
   <Sidebar.GroupContent>
    <Sidebar.Menu>
     {#each items as item (item.title)}
      <Sidebar.MenuItem>
       <Sidebar.MenuButton
        class={{ "bg-accent": page.url.pathname == item.href }}
       >
        {#snippet child({ props })}
         <a href={item.href} {...props}>
          <item.icon />
          <span>{item.title}</span>
         </a>
        {/snippet}
       </Sidebar.MenuButton>
      </Sidebar.MenuItem>
     {/each}
    </Sidebar.Menu>
   </Sidebar.GroupContent>
  </Sidebar.Group>
  <Sidebar.Group>
   <Sidebar.GroupLabel>My Library</Sidebar.GroupLabel>
   <Sidebar.GroupContent>
    <Input type="text" placeholder="Filter Library" bind:value={search} />
    <div class="mt-2 flex flex-col px-1">
     {#each $gamesStore.filter(game => game.title
       .toLowerCase()
       .includes(search.toLowerCase())) as game (game.title)}
      <a href="/game?id={game.remoteId}&name={game.title}">
       {game.title}
      </a>
     {/each}
    </div>
   </Sidebar.GroupContent>
  </Sidebar.Group>
 </Sidebar.Content>
</Sidebar.Root>
