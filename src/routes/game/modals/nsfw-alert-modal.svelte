<script lang="ts">
  import { Button } from "@ui/button";
  import * as Dialog from "@ui/dialog";
  import { Separator } from "@ui/separator";
  import { getGameContext } from "@/context";
  import { t } from "svelte-i18n";

  interface NsfwAlertModalProps {
    onCancel: () => void;
    onConfirm: () => void;
  }

  let { onCancel, onConfirm }: NsfwAlertModalProps = $props();
  const gameContext = getGameContext();
  const { title, hasNSFWContentBlocked } = $derived(gameContext);
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
