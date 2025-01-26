<script lang="ts">
 import "$lib/i18n";
 import { apps, appsByLetter } from "@/stores";
 import * as Steam from "@/types/steam.types";
 import { formatTitle } from "@/utils";
 import ky from "ky";
 import { onMount } from "svelte";

 // TODO: Use some kind of database to reduce strings size on heap
 onMount(async () => {
  if (!$apps || !appsByLetter) {
   await ky<Steam.App[]>(
    atob(
     "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2h5ZHJhbGF1bmNoZXIvaHlkcmEvcmVmcy9oZWFkcy9tYWluL3NlZWRzL3N0ZWFtLWdhbWVzLmpzb24",
    ),
   )
    .then(response => response.json())
    .then(data => {
     apps.set(data);
     appsByLetter.set(
      data.reduce<Record<string, { name: string; id: number }[]>>((acc, app) => {
       if (!app.name) return acc;
       const formattedTitle = formatTitle(app.name);
       const [firstLetter] = formattedTitle;
       if (!acc[firstLetter]) acc[firstLetter] = [];
       acc[firstLetter].push({ name: formattedTitle, id: app.id });
       return acc;
      }, {}),
     );
    });
  }
 });
</script>
