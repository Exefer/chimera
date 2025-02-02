<script lang="ts">
  import { beforeNavigate, goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Input } from "@/components/ui/input";
  import { SEARCH_DEBOUNCE } from "@/constants/";
  import { isTyping, search } from "@/stores";
  import { t } from "svelte-i18n";

  const title = () => {
    switch (page.url.pathname) {
      case "/":
        return $t("header.home");
      case "/search":
        return $t("header.search_results");
      case "/downloads":
        return $t("header.downloads");
      case "/library":
        return $t("header.library");
      case "/settings":
        return $t("header.settings");
      case "/catalog":
        return $t("header.catalog");
      case "/game-details":
        return page.url.searchParams.get("title")!;
      default:
        return document.title;
    }
  };

  beforeNavigate(() => {
    if (page.url.pathname != "/search") return;
    currentSearch = "";
  });

  let currentSearch = $state("");
  let timeout: NodeJS.Timeout | null = null;
</script>

<header
  class="sticky top-0 z-10 flex justify-between border-b border-b-border bg-header px-4 py-4"
>
  <h1 class="self-center text-lg font-bold">
    {title()}
  </h1>
  <div>
    <Input
      type="text"
      name="search"
      placeholder={$t("header.search")}
      autocomplete="off"
      bind:value={currentSearch}
      oninput={() => {
        if (!currentSearch) {
          goto("/", { keepFocus: true });
          return;
        }
        if (currentSearch === $search) return;

        if (page.url.pathname != "/search") {
          goto("/search", { keepFocus: true });
        }

        if (timeout) clearTimeout(timeout);

        isTyping.set(true);

        timeout = setTimeout(() => {
          isTyping.set(false);
          search.set(currentSearch);
        }, SEARCH_DEBOUNCE);
      }}
    />
  </div>
</header>
