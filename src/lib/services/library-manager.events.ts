import { libraryTable } from "@/database";
import { useLibrary } from "@/hooks/use-library";
import type { ProcessEvent } from "@/specta-bindings";

// TODO: Refactor

const { updateLibrary } = useLibrary();

export const onProcessStarted = async (
  data: Extract<ProcessEvent, { type: "started" }>["data"]
) => {
  await libraryTable.where({ executablePath: data.path }).modify({ running: true });

  updateLibrary();
};

export const onProcessFinished = async (
  data: Extract<ProcessEvent, { type: "finished" }>["data"]
) => {
  // TODO: Playtime will be updated every second in the future; this approach is temporary and bad
  await libraryTable.where({ executablePath: data.path }).modify({
    running: false,
    lastPlayedAt: Date.now(),
    playtimeInSeconds: data.executionTime,
  });

  updateLibrary();
};
