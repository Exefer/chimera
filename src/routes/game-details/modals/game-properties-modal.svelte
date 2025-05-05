<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import * as Sidebar from "@/components/ui/sidebar";
</script>

<Dialog.Root open>
  <Dialog.Content class="h-80">
    <Sidebar.Root>
      <Sidebar.Header />
      <Sidebar.Content>
        <Sidebar.Group />
        <Sidebar.Group />
      </Sidebar.Content>
      <Sidebar.Footer />
    </Sidebar.Root>
  </Dialog.Content>
</Dialog.Root>
