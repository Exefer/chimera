use std::{
    net::{Ipv4Addr, SocketAddr, SocketAddrV4},
    path::{Path, PathBuf},
    time::Duration,
};

use librqbit::dht::PersistentDht;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;

use crate::Error;

#[derive(Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfigDht {
    pub disable: bool,
    pub disable_persistence: bool,
    pub persistence_file: PathBuf,
}

impl Default for ChimeraConfigDht {
    fn default() -> Self {
        Self {
            disable: false,
            disable_persistence: false,
            persistence_file: PersistentDht::default_persistence_filename().unwrap(),
        }
    }
}

#[derive(Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfigTcpListen {
    pub disable: bool,
    pub min_port: u16,
    pub max_port: u16,
}

impl Default for ChimeraConfigTcpListen {
    fn default() -> Self {
        Self {
            disable: false,
            // TODO: use consts from librqbit
            min_port: 4240,
            max_port: 4260,
        }
    }
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfigPersistence {
    pub disable: bool,

    #[serde(default)]
    pub folder: PathBuf,

    #[serde(default)]
    pub fastresume: bool,

    /// Deprecated, but keeping for backwards compat for serialized / deserialized config.
    #[serde(default)]
    pub filename: PathBuf,
}

impl ChimeraConfigPersistence {
    pub(crate) fn fix_backwards_compat(&mut self) {
        if self.folder != Path::new("") {
            return;
        }
        if self.filename != Path::new("") {
            if let Some(parent) = self.filename.parent() {
                self.folder = parent.to_owned();
            }
        }
    }
}

impl Default for ChimeraConfigPersistence {
    fn default() -> Self {
        let folder = librqbit::SessionPersistenceConfig::default_json_persistence_folder().unwrap();
        Self {
            disable: false,
            folder,
            fastresume: false,
            filename: PathBuf::new(),
        }
    }
}

#[serde_as]
#[derive(Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfigPeerOpts {
    #[serde_as(as = "serde_with::DurationSeconds")]
    pub connect_timeout: Duration,

    #[serde_as(as = "serde_with::DurationSeconds")]
    pub read_write_timeout: Duration,
}

impl Default for ChimeraConfigPeerOpts {
    fn default() -> Self {
        Self {
            connect_timeout: Duration::from_secs(2),
            read_write_timeout: Duration::from_secs(10),
        }
    }
}

#[serde_as]
#[derive(Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfigHttpApi {
    pub disable: bool,
    pub listen_addr: SocketAddr,
    pub read_only: bool,
}

impl Default for ChimeraConfigHttpApi {
    fn default() -> Self {
        Self {
            disable: Default::default(),
            listen_addr: SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::new(127, 0, 0, 1), 3030)),
            read_only: false,
        }
    }
}

#[derive(Clone, Default, Serialize, Deserialize, PartialEq, Eq, Debug)]
#[serde(default)]
pub struct ChimeraConfigUpnp {
    // rename for backwards compat
    #[serde(rename = "disable")]
    pub disable_tcp_port_forward: bool,

    #[serde(default)]
    pub enable_server: bool,

    #[serde(default)]
    pub server_friendly_name: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct ChimeraConfig {
    pub default_download_location: PathBuf,

    #[serde(default)]
    pub disable_upload: bool,

    pub dht: ChimeraConfigDht,
    pub tcp_listen: ChimeraConfigTcpListen,
    pub upnp: ChimeraConfigUpnp,
    pub persistence: ChimeraConfigPersistence,
    pub peer_opts: ChimeraConfigPeerOpts,
    pub http_api: ChimeraConfigHttpApi,
}

impl Default for ChimeraConfig {
    fn default() -> Self {
        let download_folder = dirs::download_dir().unwrap();

        Self {
            default_download_location: download_folder,
            dht: Default::default(),
            tcp_listen: Default::default(),
            upnp: Default::default(),
            persistence: Default::default(),
            peer_opts: Default::default(),
            http_api: Default::default(),
            disable_upload: false,
        }
    }
}

impl ChimeraConfig {
    pub fn validate(&self) -> Result<(), Error> {
        if self.upnp.enable_server {
            if self.http_api.disable {
                return Err(Error::Other(
                    "if UPnP server is enabled, you need to enable the HTTP API also.".to_string(),
                ));
            }
            if self.http_api.listen_addr.ip().is_loopback() {
                return Err(Error::Other(
                    "if UPnP server is enabled, you need to set HTTP API IP to 0.0.0.0 or at least non-localhost address.".to_string(),
                ));
            }
        }
        Ok(())
    }
}
