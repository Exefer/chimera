import { LibraryManager } from "@/services/library-manager";
import { setLibrary } from "@/stores";

export function useLibrary() {
  const updateLibrary = () =>
    LibraryManager.getLibrary().then(library => setLibrary(library));

  return { updateLibrary };
}
