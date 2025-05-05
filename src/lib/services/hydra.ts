import { CatalogueCategory } from "@/constants";
import { fetch } from "@tauri-apps/plugin-http";
import ky from "ky";

export class HydraApi {
  private static instance = ky.create({
    prefixUrl: import.meta.env.VITE_HYDRA_API_URL,
    fetch,
  });

  public static getCatalogue(category: CatalogueCategory) {
    const searchParams = new URLSearchParams({
      take: "12",
      skip: "0",
    });

    return this.instance<
      Array<{ title: string; shop: "steam" | "epic"; objectId: string }>
    >(`catalogue/${category}?${searchParams.toString()}`).json();
  }
}
