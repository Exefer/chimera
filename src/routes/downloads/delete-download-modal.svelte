<script lang="ts">
  import { buttonVariants } from "@/components/ui/button";
  import * as Dialog from "@/components/ui/dialog";
  import { Separator } from "@/components/ui/separator";
  import { t } from "svelte-i18n";

  interface DeleteDownloadModalProps {
    open: boolean;
    onCancel(): void;
    onConfirm(): void;
  }

  let { open, onCancel, onConfirm }: DeleteDownloadModalProps = $props();
</script>

<Dialog.Root {open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t("common.are_you_sure")}</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description>
      {$t("downloads.remove_installer:description")}
    </Dialog.Description>
    <Separator />
    <Dialog.Footer>
      <Dialog.Close class={buttonVariants({ variant: "outline" })} onclick={onConfirm}
        >{$t("common.confirm")}</Dialog.Close
      >
      <Dialog.Close class={buttonVariants()} onclick={onCancel}
        >{$t("common.cancel")}</Dialog.Close
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
