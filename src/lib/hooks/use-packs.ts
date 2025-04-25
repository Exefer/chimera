import { packsTable } from "@/database";
import { liveQuery } from "dexie";

export function usePacks() {
  const getPacksForRemoteId = (remoteId: string) =>
    packsTable.filter(pack => pack.remoteIds.includes(remoteId)).toArray();

  const getObservablePacksForRemoteId = (remoteId: string) =>
    liveQuery(() => getPacksForRemoteId(remoteId));

  return { getPacksForRemoteId, getObservablePacksForRemoteId };
}
