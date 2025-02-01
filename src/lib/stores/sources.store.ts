import * as Persistent from "@/stores/persistent";
import * as Types from "@/types";
import { get, writable } from "svelte/store";

function createSourcesStore() {
 const store = writable<Types.Source[]>([]);

 Persistent.sources.get().then(sources => {
  if (sources)
   Promise.all(
    sources.map(url =>
     fetch(url)
      .then(response => response.json())
      .then(data => ({ ...data, url })),
    ),
   ).then(sources => {
    store.set(sources);
   });
  store.subscribe(async sources => {
   await Persistent.sources.set(sources.map(source => source.url));
  });
 });

  /**
   * Adds a source to the store.
   */
  const addSource = (
    source: Types.Source,
    callback?: (sources: Types.Source[]) => void
  ) =>
    store.update(state => {
      state.push(source);

      if (callback) callback(state);

      return state;
    });

  /**
   * Removes a source from the store.
   */
  const removeSource = (index: number, callback?: (sources: Types.Source[]) => void) =>
    store.update(state => {
      state.splice(index, 1);

      if (callback) callback(state);

      return state;
    });

  /**
   * Refreshes the sources in the store.
   *
   * NOTE: This will change soon
   */
  const refreshSources = async () => {
    const sources = await Promise.all(
      get(store).map(async ({ url }) =>
        fetch(url)
          .then(response => response.json())
          .then(data => ({ ...data, url }))
      )
    );

    store.set(sources);
  };

  return {
    ...store,
    addSource,
    removeSource,
    refreshSources,
  };
}

export const sources = createSourcesStore();
