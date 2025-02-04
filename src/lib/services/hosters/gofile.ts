import ky from "ky";

export interface GofileAccountsResponse {
  id: string;
  token: string;
}

export interface GofileContentChild {
  id: string;
  link: string;
}

export interface GofileContentsResponse {
  id: string;
  type: string;
  children: Record<string, GofileContentChild>;
}

export const WT = "4fd6sg89d7s6";

export class GofileApi {
  private static token: string;

  public static async authorize() {
    const response = await ky
      .post<{
        status: string;
        data: GofileAccountsResponse;
      }>("https://api.gofile.io/accounts")
      .json();

    if (response.status === "ok") {
      this.token = response.data.token;
      return this.token;
    }

    throw new Error("Failed to authorize");
  }

  public static async getDownloadLink(id: string) {
    const response = await ky<{
      status: string;
      data: GofileContentsResponse;
    }>(`https://api.gofile.io/contents/${id}?wt=${WT}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }).json();

    if (response.status === "ok") {
      if (response.data.type !== "folder") {
        throw new Error("Only folders are supported");
      }

      const [firstChild] = Object.values(response.data.children);
      return firstChild.link;
    }

    throw new Error("Failed to get download link");
  }
}
