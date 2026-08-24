import { Box, Button, Field, Flex, Heading, Image, Input, NativeSelect, Stack, Table, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

import Pagination from "@/components/ui/pagination";
import api, { type MovieLanguage, type PaginatedMovies } from "@/lib/api";

const movieLanguages: Array<{ label: string; value: MovieLanguage }> = [
  { label: "Selecione", value: "" },
  { label: "Português", value: "pt-BR" },
  { label: "Inglês", value: "en-US" },
  { label: "Espanhol", value: "es-ES" },
  { label: "Japonês", value: "ja-JP" },
];

const scalar = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const parsePage = (page: string | string[] | undefined) => {
  const value = scalar(page);
  const parsedPage = Number(value);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

const parseQuery = (query: string | string[] | undefined) => {
  const value = scalar(query);

  return value?.trim() || "";
}

const parseLanguage = (language: string | string[] | undefined): MovieLanguage => {
  const value = scalar(language);

  return movieLanguages.some((movieLanguage) => movieLanguage.value === value) ? value as MovieLanguage : "";
}

const pageHref = (page: number, query: string, language: MovieLanguage) => {
  const params = new URLSearchParams({ page: String(page) });

  if (query) params.set("query", query);
  params.set("language", language);

  return `/movies?${params.toString()}`;
}

export default function Movies() {
  const router = useRouter();
  const page = router.isReady ? parsePage(router.query.page) : 1;
  const searchQuery = router.isReady ? parseQuery(router.query.query) : "";
  const language = router.isReady ? parseLanguage(router.query.language) : "";
  const requestKey = `${page}:${searchQuery}:${language}`;
  const [movies, setMovies] = useState<PaginatedMovies | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [failedKey, setFailedKey] = useState("");

  const loaded = movies !== null && loadedKey === requestKey;
  const failed = failedKey === requestKey;
  const loading = router.isReady && !loaded && !failed;

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;

    api.movies.list({ page, query: searchQuery, language })
      .then((result) => {
        if (!active) return;

        setMovies(result);
        setLoadedKey(requestKey);
      })
      .catch(() => {
        if (!active) return;

        setFailedKey(requestKey);
      });

    return () => {
      active = false;
    }
  }, [language, page, requestKey, router.isReady, searchQuery]);

  const tableInfo = (
    <Table.Row>
      <Table.ColumnHeader>Poster</Table.ColumnHeader>
      <Table.ColumnHeader>Título</Table.ColumnHeader>
      <Table.ColumnHeader>Lançamento</Table.ColumnHeader>
      <Table.ColumnHeader>Popularidade</Table.ColumnHeader>
      <Table.ColumnHeader>Nota</Table.ColumnHeader>
      <Table.ColumnHeader>Votos</Table.ColumnHeader>
    </Table.Row>
  );

  const emptyData = (
    <Table.Row>
      <Table.Cell colSpan={6}>
        Sem filmes
      </Table.Cell>
    </Table.Row>
  );

  const tableData = () => {
    if (loading || !movies) return (
      <Table.Row>
        <Table.Cell colSpan={6}>
          Carregando
        </Table.Cell>
      </Table.Row>
    );

    if (failed) return (
      <Table.Row>
        <Table.Cell colSpan={6}>
          Não foi possível carregar os filmes
        </Table.Cell>
      </Table.Row>
    );

    if (movies.items.length === 0) return emptyData;

    return movies.items.map((movie) => (
      <Table.Row key={movie.id}>
        <Table.Cell>
          {movie.poster_url ? (
            <Image src={movie.poster_url} alt={movie.title} w="56px" borderRadius="md" />
          ) : (
            <Box w="56px" h="84px" bg="gray.100" borderRadius="md" />
          )}
        </Table.Cell>
        <Table.Cell>
          <Stack gap="1">
            <Text fontWeight="semibold">{movie.title}</Text>
            <Text color="gray.500" fontSize="sm">
              {movie.original_title}
            </Text>
          </Stack>
        </Table.Cell>
        <Table.Cell>{movie.formatted_release_date}</Table.Cell>
        <Table.Cell>{movie.popularity}</Table.Cell>
        <Table.Cell>{movie.vote_average}</Table.Cell>
        <Table.Cell>{movie.vote_count}</Table.Cell>
      </Table.Row>
    ));
  }

  return (
    <Stack gap="5">
      <Box>
        <Heading as="h1" size="lg" mb="2">
          Filmes
        </Heading>
        <Text color="gray.600">
          Busque filmes disponíveis para criação de eventos.
        </Text>
      </Box>

      <Flex
        align="end"
        justify="space-between"
        gap="4"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="gray.50"
        py="3"
      >
        <Box flex="1" minW="0">
          {movies && (
            <Pagination
              page={movies.page}
              totalPages={movies.total_pages}
              totalCount={movies.total_count}
              getPageHref={(page) => pageHref(page, searchQuery, language)}
            />
          )}
        </Box>

        <form style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <Flex align="end" justify="flex-end" gap="3">
            <input type="hidden" name="page" value="1" />

            <Field.Root w="180px" flexShrink={0}>
              <Field.Label>Idioma Preferencial</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field name="language">
                  {movieLanguages.map((movieLanguage) => (
                    <option selected={movieLanguage.value === language} key={movieLanguage.value} value={movieLanguage.value}>
                      {movieLanguage.label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root w="360px" maxW="100%">
              <Field.Label>Buscar filme</Field.Label>
              <Input name="query" defaultValue={searchQuery} placeholder="Digite o título do filme" />
            </Field.Root>

            <Button type="submit" colorPalette="blue">
              <FaSearch />
              Buscar
            </Button>
          </Flex>
        </form>
      </Flex>

      <Box overflowX="auto">
        <Table.Root>
          <Table.Header>
            {tableInfo}
          </Table.Header>

          <Table.Body>
            {tableData()}
          </Table.Body>

          <Table.Footer>
            {tableInfo}
          </Table.Footer>
        </Table.Root>
      </Box>
    </Stack>
  );
}
