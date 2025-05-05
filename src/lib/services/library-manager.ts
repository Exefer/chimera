import { libraryTable } from "@/database";
import { useLibrary } from "@/hooks/use-library";
import { commands, type ShortcutLocation } from "@/specta-bindings";
import { steamGames } from "@/stores";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import { steamImageBuilder } from "./steam";

const { updateLibrary } = useLibrary();

export class LibraryManager {
  public static getLibrary() {
    return libraryTable.toArray();
  }

  public static async addGameToFavorites(objectId: string) {
    await libraryTable.where({ objectId }).modify({ favorite: true });

    updateLibrary();
  }

  public static async removeGameFromFavorites(objectId: string) {
    await libraryTable.where({ objectId }).modify({ favorite: false });

    updateLibrary();
  }

  public static async addGameToLibrary(objectId: string, title: string) {
    const clientIcon = get(steamGames).find(app => app.id === objectId)?.clientIcon;
    const iconUrl = clientIcon ? steamImageBuilder.icon(objectId, clientIcon) : null;

    await libraryTable.add({
      title,
      objectId,
      iconUrl,
      playtimeInSeconds: 0,
      executablePath: null,
      lastPlayedAt: null,
      launchOptions: null,
      size: null,
      running: false,
      favorite: false,
    });

    updateLibrary();
  }

  public static async removeGameFromLibrary(objectId: string) {
    await libraryTable.where({ objectId }).delete();

    updateLibrary();
  }

  public static async createGameShortcut(objectId: string, location: ShortcutLocation) {
    const game = await libraryTable.where({ objectId }).first();

    if (!game) return;

    const result = await commands.createShortcut(game.executablePath!, location);

    if (!result) return;

    if (result.status === "ok") {
      toast.success(get(t)("game.create_shortcut:success"));
    } else {
      toast.error(get(t)("game.create_shortcut:error"));
    }
  }

  public static async openGame(objectId: string) {
    const game = await libraryTable.where({ objectId }).first();

    if (!game) return;

    await commands.startProcess(game.executablePath!, true);
  }

  public static async closeGame(objectId: string) {
    const game = await libraryTable.where({ objectId }).first();

    if (!game) return;

    await commands.killProcess(game.executablePath!);
  }

  public static async updateExecutablePath(
    objectId: string,
    executablePath: string | null
  ) {
    await libraryTable.where({ objectId }).modify({ executablePath });

    updateLibrary();
  }

  public static async updateLaunchOptions(
    objectId: string,
    launchOptions: string | null
  ) {
    await libraryTable.where({ objectId }).modify({ launchOptions });

    updateLibrary();
  }
}
