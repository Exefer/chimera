<div align="center">
    <h1>Chimera</h1>
    <p><em>Chimera is a game launcher featuring an embedded BitTorrent client and supporting direct downloads</em></p>
    <p>
        <img src="https://img.shields.io/github/last-commit/aryxst/chimera" alt="Last Commit">
        <img src="https://img.shields.io/github/issues-raw/aryxst/chimera" alt="Issues">
</div>

## About

Chimera is a game launcher featuring an embedded BitTorrent client and supporting direct downloads. The backend is made with Tauri and the frontend with SvelteKit and TypeScript.

It's a work in progress and it's not ready for production.

## Table of contents

- [Features](#features)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
  - [Implemented](#implemented)
  - [Planned](#planned)
- [Join the community](#join-the-community)
- [License](#license)

## Features

- Support for 2 languages
<details>
<summary>Click to expand</summary>

- English
- Italian
</details>

- Library management
- Customizable downloads path
- Dark and light themes
- BitTorrent client
- Direct downloads(HTTP/HTTPS)
- Regular updates

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Roadmap

### Implemented

- [x] Direct downloads
- [x] Desktop shortcut creation
- [x] Pausing and resuming downloads
- [x] Add NSFW content blurring based on user settings
- [x] Use [Dexie(IndexedDB)](https://dexie.org/) instead of Svelte stores
- [x] Improve game details load times with caching
- [ ] Game launch arguments

### Planned

- [ ] Cloud saves with RClone and Ludusavi
- [ ] Gamepad support
- [ ] UI Improvements
- [ ] Torrent downloads

## Join the community

This can be helpful to get help or to discuss about the app. Also if you want to contribute to the project, to simplify the process.

- [Discord][DISCORD_INVITE_LINK]

## License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

[DISCORD_INVITE_LINK]: https://discord.gg/Ffk49A7z9F
