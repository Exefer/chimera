<script lang="ts">
  import { Button } from "@/components/ui/button";
  import * as Dialog from "@/components/ui/dialog";
  import { Separator } from "@/components/ui/separator";
  import { getGameDetailsContext } from "@/context";
  import { t } from "svelte-i18n";

  interface NsfwAlertModalProps {
    onCancel: () => void;
    onConfirm: () => void;
  }

  let { onCancel, onConfirm }: NsfwAlertModalProps = $props();

  const gameDetailsContext = getGameDetailsContext();
  const { title, hasNSFWContentBlocked } = $derived(gameDetailsContext);
</script>

<Dialog.Root open={hasNSFWContentBlocked}>
  <Dialog.Content interactOutsideBehavior="ignore" hideCloseButton>
    <Dialog.Header>
      <Dialog.Title>{$t("game.nsfw_content_alert:title")}</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <Dialog.Description>
      {$t("game.nsfw_content_alert:description", {
        values: {
          title,
        },
      })}
    </Dialog.Description>
    <Dialog.Footer>
      <Button variant="outline" onclick={onCancel}
        >{$t("game.nsfw_content_alert:refuse")}</Button
      >
      <Button variant="destructive" onclick={onConfirm}
        >{$t("game.nsfw_content_alert:allow")}</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
