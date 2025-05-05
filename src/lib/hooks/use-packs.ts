import { packsTable } from "@/database";
import { packs, setPacks } from "@/stores";
import { get } from "svelte/store";

export function usePacks() {
  const getPacksForObjectId = (objectId: string) =>
    get(packs).filter(pack => pack.objectIds.includes(objectId));

  const updatePacks = () => packsTable.toArray().then(packs => setPacks(packs));

  return { getPacksForObjectId, updatePacks };
}
