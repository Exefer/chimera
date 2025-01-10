export const steamImageBuilder = {
 library: (id: string | number) =>
  `https://steamcdn-a.akamaihd.net/steam/apps/${id}/header.jpg`,
 libraryHero: (id: string | number) =>
  `https://steamcdn-a.akamaihd.net/steam/apps/${id}/library_hero.jpg`,
 logo: (id: string | number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/logo.png`,
 cover: (id: string | number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`,
 icon: (id: string | number, clientIcon: string) =>
  `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${id}/${clientIcon}.ico`,
};
