//! This module contains constants used throughout the application.

/// The default user agent used for HTTP requests.
pub const DEFAULT_USER_AGENT: &str = "chimera";
/// Only sends a progress event every `x` iterations of the download loop to reduce overhead
pub const PROGRESS_EVENT_SKIP: u32 = 5000;
