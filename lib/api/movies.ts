import { APIEndpoint, type PaginatedResult } from "./common-entities";

export interface MovieResponse {
  id: number;
  adult: boolean;
  title: string;
  video: boolean;
  overview: string;
  softcore: boolean;
  genre_ids: Array<number>;
  popularity: number;
  vote_count: number;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  backdrop_path: string | null;
  original_title: string;
  original_language: string;
}

export interface Movie extends MovieResponse {
  poster_url: string | null;
  backdrop_url: string | null;
  formatted_release_date: string;
}

export type PaginatedMovies = PaginatedResult<Movie>;
export type MovieLanguage = '' | 'en-US' | 'es-ES' | 'ja-JP' | 'pt-BR';

const tmdbImageUrl = (path: string | null) => {
  if (!path) return null;

  return `https://image.tmdb.org/t/p/original/${path}`;
}

export const presentMovie = (movie: MovieResponse): Movie => {
  return {
    ...movie,
    formatted_release_date: movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "Não informado",
    backdrop_url: tmdbImageUrl(movie.backdrop_path),
    poster_url: tmdbImageUrl(movie.poster_path),
  };
}

class MoviesEndpoint extends APIEndpoint {
  list({
    page = 1,
    itemsPerPage = 10,
    query = "",
    language = ""
  }: { page?: number; itemsPerPage?: number; query?: string; language?: MovieLanguage } = {}): Promise<PaginatedMovies> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: "/movies",
        method: "GET",
        query: {
          page,
          itemsPerPage,
          language: language,
          ...(query ? { query } : {}),
        },
      }).then(async (response) => {
        if (!response.ok) return reject();

        const results = await response.json();

        results.items = results.items.map((item: MovieResponse) => presentMovie(item));

        resolve(results);
      });
    });
  }
}

export default MoviesEndpoint;
