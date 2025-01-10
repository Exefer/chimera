export interface Genre {
 id: string;
 name: string;
}

export interface Screenshot {
 id: number;
 path_thumbnail: string;
 path_full: string;
}

export interface VideoSource {
 max: string;
 "480": string;
}

export interface Movies {
 id: number;
 mp4: VideoSource;
 webm: VideoSource;
 thumbnail: string;
 name: string;
 highlight: boolean;
}

export interface PackageGroup {
 name: string;
 title: string;
 description: string;
 selection_text: string;
 save_text: string;
 display_type: number;
 is_recurring_subscription: string;
 subs: Subscription[];
}

export interface Subscription {
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

export interface Metacritic {
 score: number;
 url: string;
}

export interface Category {
 id: number;
 description: string;
}

export interface Recommendations {
 total: number;
}

export interface SupportInfo {
 url: string;
 email: string;
}

export interface Ratings {
 usk: RatingDetail;
 dejus: ExtendedRatingDetail;
 steam_germany: ExtendedRatingDetail;
}

export interface RatingDetail {
 rating: string;
}

export interface ExtendedRatingDetail extends RatingDetail {
 rating_generated: string;
 required_age: string;
 banned: string;
 use_age_gate: string;
 descriptors: string;
}

export interface App {
 name: string;
 id: number;
 clientIcon: string;
}

export interface AppDetails {
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
 genres: Genre[];
 movies?: Movies[];
 screenshots?: Screenshot[];
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
