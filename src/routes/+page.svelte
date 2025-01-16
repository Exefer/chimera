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
  "https://cdn-lfs.hf.co/repos/28/10/2810245724ae5d50b699442c96812df0e1ec8a85aeaeca833fc99f050333ef76/d3b3458a3e7f9944336f446477d10a0987ca12fc97b2e6f5ab0aa75e50577ceb?response-content-disposition=attachment%3B+filename*%3DUTF-8%27%27MMVCServerSIO_win_onnxgpu-cuda_v.1.5.3.18a.zip%3B+filename%3D%22MMVCServerSIO_win_onnxgpu-cuda_v.1.5.3.18a.zip%22%3B&response-content-type=application%2Fzip&Expires=1737165398&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTczNzE2NTM5OH19LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5oZi5jby9yZXBvcy8yOC8xMC8yODEwMjQ1NzI0YWU1ZDUwYjY5OTQ0MmM5NjgxMmRmMGUxZWM4YTg1YWVhZWNhODMzZmM5OWYwNTAzMzNlZjc2L2QzYjM0NThhM2U3Zjk5NDQzMzZmNDQ2NDc3ZDEwYTA5ODdjYTEyZmM5N2IyZTZmNWFiMGFhNzVlNTA1NzdjZWI%7EcmVzcG9uc2UtY29udGVudC1kaXNwb3NpdGlvbj0qJnJlc3BvbnNlLWNvbnRlbnQtdHlwZT0qIn1dfQ__&Signature=FSM5aAJzEUXKrEc0lZOnyaiSF7-ptze0fYcM1cpohfrC02WV3LHBtGjORPlJeMmIdAHcNOoQnzl7morZRsQdkYmzMsfO6JPyMdAFsIsr%7EmcWqQmxy6E6eRN%7E56gBrqoqsDaRD8nkoYSXMztOsRt2gzPLVZsq8lQ4EI8rXcSziFAkZdHwg8zMvM-uVruoLbwnZMEfwe%7EKFI8EbkP%7E%7ENVz3CrzjVw5xzjj1K7vLG4ZoJKBM3PWh3CGHdvBuW7FmvJupr27Xu3mAy1rfp6s3rWq3ix63c-EL4dUfkV4ZUQ6O7GYTEuLgfk3f-O5tKq09xgihAy9nBKWeXy0aGqBvsKmvw__&Key-Pair-Id=K3RPWS32NSSJCE";
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
   downloads.addDownload(TEST_URL, "69420", "Scary App!1!");
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
    download.content_length - download.remaining_bytes!,
   );
   toast(
    `Download resumed from ${formatBytes(download.content_length - download.remaining_bytes!)}!`,
   );
  }}>Resume</Button
 >
 <pre class="max-w-xs">{JSON.stringify($downloads, null, 2)}</pre>
</div>
<!-- END OF TESTING -->
