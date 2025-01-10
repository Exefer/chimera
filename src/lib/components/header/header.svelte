<script lang="ts">
 import { goto } from "$app/navigation";
 import { page } from "$app/state";
 import { Input } from "@/components/ui/input";
 import { isTyping, search } from "@/store/state.store";

 const title = () => {
  switch (page.url.pathname) {
   case "/":
    return "Home";
   case "/catalogue":
    return "Catalogue";
   case "/search":
    return "Search Results";
   case "/downloads":
    return "Downloads";
   case "/library":
    return "Library";
   case "/settings":
    return "Settings";
   case "/game":
    return page.url.searchParams.get("name")!;
   default:
    return document.title;
  }
 };

 let timeout: number | null = null;
</script>

<header
 class="sticky top-0 z-10 flex justify-between border-b border-b-border bg-sidebar px-4 py-4"
>
 <h1 class="self-center text-lg font-bold">
  {title()}
 </h1>
 <div>
  <Input
   autocomplete="off"
   placeholder="Search Apps"
   oninput={event => {
    const currentSearch = (event.target as HTMLInputElement).value;

    if (!currentSearch) {
     goto("/", { keepFocus: true });
     return;
    }
    if (currentSearch == $search) return;

    if (page.url.pathname != "/search") {
     goto("/search", { keepFocus: true });
    }

    if (timeout) clearTimeout(timeout);

    isTyping.set(true);
    setTimeout(() => {
     isTyping.set(false);
     search.set(currentSearch);
    }, 750);
   }}
  />
 </div>
</header>
