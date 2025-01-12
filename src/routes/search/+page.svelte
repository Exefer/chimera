<script lang="ts">
 import * as Pagination from "@/components/ui/pagination";
 import { ITEMS_PER_PAGE } from "@/constants";
 import { appsList, isTyping, search } from "@/store/state.store";
 import uFuzzy from "@leeoniya/ufuzzy";
 import { get } from "svelte/store";

 const ITEMS_PER_PAGE = 20;

 const uf = new uFuzzy({
  intraMode: 0,
  intraIns: 1,
  interIns: Infinity,
  intraChars: "[a-z\d']",
  interChars: ".",
  interLft: 0,
  interRgt: 0,
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,
 });

 let currentPage = $state<number>(1);
 const haystack = $appsList.map(entry => entry.name);

 let searchResults = $derived.by(() => {
  if (!$search) return [];
  const apps = get(appsList);
  const [idxs] = uf.search(haystack, $search);

  return idxs?.map(index => apps[index]);
 });
</script>

<div class="p-4">
 {#if searchResults && searchResults.length && !$isTyping}
  {@const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE)}
  {@const startIndex = (currentPage - 1) * ITEMS_PER_PAGE}
  {@const end =
   currentPage == totalPages
    ? searchResults.length
    : startIndex + ITEMS_PER_PAGE}
  <div class="flex flex-col">
   {#each searchResults.slice(startIndex, end) as item}
    <a href="/game/?id={item.id}&name={item.name}">
     {item.name}
    </a>
   {/each}
  </div>
  <Pagination.Root
   count={searchResults.length}
   perPage={ITEMS_PER_PAGE}
   bind:page={currentPage}
  >
   {#snippet children({ pages, currentPage })}
    <span
     ><span class="font-bold">{startIndex == 0 ? 1 : startIndex}-{end}</span>
     <span>of {searchResults.length}</span></span
    >
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
 {:else if $isTyping}
  Typing...
 {:else if !searchResults?.length}
  No Results
 {/if}
</div>
