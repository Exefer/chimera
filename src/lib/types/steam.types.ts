export interface SteamGenre {
  id: string;
  name: string;
}

export interface SteamScreenshot {
  id: number;
  path_thumbnail: string;
  path_full: string;
}

export interface SteamVideoSource {
  max: string;
  "480": string;
}

export interface SteamMovies {
  id: number;
  mp4: SteamVideoSource;
  webm: SteamVideoSource;
  thumbnail: string;
  name: string;
  highlight: boolean;
}

interface PackageGroup {
  name: string;
  title: string;
  description: string;
  selection_text: string;
  save_text: string;
  display_type: number;
  is_recurring_subscription: string;
  subs: Subscription[];
}

interface Subscription {
  packageid: number;
  percent_savings_text: string;
  percent_savings: number;
  option_text: string;
  option_description: string;
  can_get_free_license: string;
  is_free_license: boolean;
  price_in_cents_with_discount: number;
}

export interface Platform {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

interface Metacritic {
  score: number;
  url: string;
}

interface Category {
  id: number;
  description: string;
}

interface Recommendations {
  total: number;
}

interface SupportInfo {
  url: string;
  email: string;
}

interface Ratings {
  usk: RatingDetail;
  dejus: ExtendedRatingDetail;
  steam_germany: ExtendedRatingDetail;
}

interface RatingDetail {
  rating: string;
}

interface ExtendedRatingDetail extends RatingDetail {
  rating_generated: string;
  required_age: string;
  banned: string;
  use_age_gate: string;
  descriptors: string;
}

export interface SteamGame {
  name: string;
  id: string;
  clientIcon: string;
}

export interface SteamAppDetails {
  name: string;
  type: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string | null;
  developers: string[];
  publishers: string[];
  genres: SteamGenre[];
  movies?: SteamMovies[];
  screenshots?: SteamScreenshot[];
  packages: number[];
  package_groups: PackageGroup[];
  pc_requirements: {
    minimum: string;
    recommended?: string;
  };
  mac_requirements: {
    minimum: string;
    recommended?: string;
  };
  linux_requirements: {
    minimum: string;
    recommended?: string;
  };
  platforms: Platform;
  metacritic: Metacritic;
  categories: Category[];
  recommendations: Recommendations;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  content_descriptors: {
    ids: number[];
    notes?: string;
  };
  support_info: SupportInfo;
  background: string;
  background_raw: string;
  ratings: Ratings;
}

export interface SteamAppDetailsResponse {
  [key: string]: {
    success: boolean;
    data: SteamAppDetails;
  };
}
