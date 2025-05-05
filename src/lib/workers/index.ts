export const downloadSourcesWorker = new ComlinkWorker<
  typeof import("./download-sources.worker")
>(new URL("./download-sources.worker", import.meta.url));
