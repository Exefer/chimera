<script lang="ts">
  import * as Pagination from "@/components/ui/pagination";
  import { ITEMS_PER_PAGE } from "@/constants/";
  import { isTyping, search, steamGames } from "@/stores";
  import { number, t } from "svelte-i18n";
  import uFuzzy from "@leeoniya/ufuzzy";
  import SearchResults from "./search-results.svelte";

  // See https://github.com/leeoniya/uFuzzy#options
  const uf = new uFuzzy({
    intraMode: 0,
    intraIns: 1,
    interIns: Infinity,
    intraChars: "[a-z\\d]",
    interChars: ".",
    interLft: 0,
    interRgt: 0,
    intraSub: 1,
    intraTrn: 1,
    intraDel: 1,
  });

  const haystack = $steamGames.map(app => app.name);
  const searchResults = $derived.by(() => {
    if (!$search) return [];
    const idxs = uf.filter(haystack, $search)!;

    return idxs.map(index => $steamGames[index]);
  });
  let currentPage = $state<number>(1);
  const totalPages = $derived(Math.ceil(searchResults.length / ITEMS_PER_PAGE));
  const startIndex = $derived((currentPage - 1) * ITEMS_PER_PAGE);
  const endIndex = $derived(
    currentPage === totalPages ? searchResults.length : startIndex + ITEMS_PER_PAGE
  );

  $effect(() => {
    searchResults;
    currentPage = 1;
  });
</script>

<main
  class="flex h-[var(--content-height)] flex-col items-center justify-between overflow-scroll p-4"
>
  {#if $isTyping}
    <p class="text-muted-foreground">{$t("search.typing")}</p>
  {:else if searchResults?.length > 0}
    <SearchResults results={searchResults.slice(startIndex, endIndex)} />

    <Pagination.Root
      count={searchResults.length}
      perPage={ITEMS_PER_PAGE}
      bind:page={currentPage}
    >
      {#snippet children({ pages, currentPage })}
        <p class="mt-2">
          {$t("search.displaying", {
            values: {
              range: `${startIndex === 0 ? 1 : $number(startIndex)}-${$number(endIndex)}`,
              total: $number(searchResults.length),
            },
          })}
        </p>
        <Pagination.Content class="mt-2">
          <Pagination.Item>
            <Pagination.PrevButton />
          </Pagination.Item>
          {#each pages as page (page.key)}
            {#if page.type === "ellipsis"}
              <Pagination.Item>
                <Pagination.Ellipsis />
              </Pagination.Item>
            {:else}
              <Pagination.Item>
                <Pagination.Link {page} isActive={currentPage === page.value}>
                  {page.value}
                </Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}
          <Pagination.Item>
            <Pagination.NextButton />
          </Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
  {:else}
    <p class="text-muted-foreground">{$t("search.no_results")}</p>
  {/if}
</main>
