<script lang="ts">
 import "$lib/i18n";
 import { Button } from "@/components/ui/button";
 import { appsList, downloads } from "@/stores";
 import * as Steam from "@/types/steam.types";
 import { formatBytes } from "@/utils";
 import ky from "ky";
 import { onMount } from "svelte";
 import { toast } from "svelte-sonner";

 /* TESTING */
 const TEST_URL =
  "https://releases.ubuntu.com/24.04.1/ubuntu-24.04.1-desktop-amd64.iso";
 /* END OF TESTING */
 onMount(async () => {
  await ky<Steam.App[]>(
   atob(
    "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2h5ZHJhbGF1bmNoZXIvaHlkcmEvcmVmcy9oZWFkcy9tYWluL3NlZWRzL3N0ZWFtLWdhbWVzLmpzb24",
   ),
  )
   .then(response => response.json())
   .then(data => appsList.set(data));
 });
</script>

<!-- TESTING -->
<div class="p-4">
 <Button
  onclick={() => {
   downloads.addDownload(TEST_URL, "69420", "Scary App!1!", "test.zip");
   toast("Download started!");
  }}>Start</Button
 >
 <Button
  onclick={() => {
   downloads.abortDownload(TEST_URL);
   const target = $downloads.findIndex(download => download.url == TEST_URL);
   if (target != -1) $downloads.splice(target, 1);
   toast("Download aborted");
  }}>Abort</Button
 >
 <Button
  onclick={() => {
   downloads.pauseDownload(TEST_URL);
   toast("Download paused!");
  }}>Pause</Button
 >

 <Button
  onclick={async () => {
   const download = $downloads[0];

   downloads.resumeDownload(
    download.url,
    download.path!,
    download.downloaded_bytes!,
   );
   toast(`Download resumed from ${formatBytes(download.downloaded_bytes!)}!`);
  }}>Resume</Button
 >
 <pre class="max-w-xs">{JSON.stringify($downloads, null, 2)}</pre>
</div>
<!-- END OF TESTING -->
