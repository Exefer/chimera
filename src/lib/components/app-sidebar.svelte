<script lang="ts">
  import * as Sidebar from "@/components/ui/sidebar";
  import { constructGameUrl } from "@/helpers";
  import { library } from "@/stores";
  import type { Game } from "@/types";
  import { page } from "$app/state";
  import { t } from "svelte-i18n";
  import Book from "lucide-svelte/icons/book";
  import DownloadIcon from "lucide-svelte/icons/download";
  import House from "lucide-svelte/icons/house";
  import SettingsIcon from "lucide-svelte/icons/settings";

  const items = $derived([
    {
      title: $t("common.home"),
      href: "/",
      icon: House,
    },
    {
      title: $t("common.downloads"),
      href: "/downloads",
      icon: DownloadIcon,
    },
    {
      title: $t("common.library"),
      href: "/library",
      icon: Book,
    },
    {
      title: $t("common.settings"),
      href: "/settings",
      icon: SettingsIcon,
    },
  ]);

  let search = $state("");

  const favoriteGames = $derived($library.filter(game => game.favorite));
</script>

{#snippet library_item(game: Game, props: Record<string, unknown>)}
  <a href={constructGameUrl(game.objectId, game.title)} {...props}>
    <img src={game.iconUrl} width="20" alt={game.title} class="rounded-md" />
    <span class={[game.executablePath && "font-bold"]}>{game.title}</span>
  </a>
{/snippet}

<Sidebar.Root>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.href)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                class={{ "bg-sidebar-accent": page.url.pathname === item.href }}
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
    {#if favoriteGames.length > 0}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{$t("sidebar.favorites")}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each favoriteGames.toSorted( (a, b) => a.title.localeCompare(b.title) ) as game (game.title)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  {#snippet child({ props })}
                    {@render library_item(game, props)}
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/if}
    <Sidebar.Group>
      <Sidebar.GroupLabel>{$t("common.library")}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Input
          type="text"
          placeholder={$t("sidebar.filter_by_name")}
          bind:value={search}
        />
        <Sidebar.Menu class="mt-2">
          {#each $library
            .filter(game => game.title.toLowerCase().includes(search.toLowerCase()))
            .toSorted((a, b) => a.title.localeCompare(b.title)) as game (game.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  {@render library_item(game, props)}
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>
