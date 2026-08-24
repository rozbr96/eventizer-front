import { Badge, Box, Heading, Image, SimpleGrid, Stack, Text } from "@chakra-ui/react";

import { type Event } from "@/lib/api";

type DetailItem = {
  label: string;
  value: string | number | boolean | null | undefined;
}

const displayValue = (value: DetailItem["value"]) => {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return "Não informado";

  return value;
}

function DetailCard({ title, details }: { title: string; details: DetailItem[] }) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="6" bg="white">
      <Heading as="h2" size="md" mb="4">
        {title}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {details.map((detail) => (
          <Box key={detail.label}>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              {detail.label}
            </Text>

            <Text color="gray.900" fontWeight="semibold">
              {displayValue(detail.value)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default function EventDetail({ event }: { event: Event }) {
  const eventDetails = [
    { label: "Evento", value: event.title },
    { label: "Descrição", value: event.description },
    { label: "Data/Horário", value: event.formatted_datetime },
    { label: "Local", value: event.address_title },
    { label: "Endereço", value: event.address },
    { label: "Capacidade", value: event.capacity },
    { label: "Preço", value: event.formatted_price },
    { label: "Status", value: event.translated_status },
    { label: "Organizador", value: event.organizer.name },
  ];

  const metadataDetails = [
    { label: "Filme", value: event.metadata.title },
    { label: "Título original", value: event.metadata.original_title },
    { label: "Idioma original", value: event.metadata.original_language },
    { label: "Lançamento", value: event.metadata.formatted_release_date },
    { label: "Popularidade", value: event.metadata.popularity },
    { label: "Votos", value: event.metadata.vote_count },
    { label: "Nota média", value: event.metadata.vote_average },
  ];

  return (
    <Stack gap="8">
      <Box
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
        bg="white"
        boxShadow="sm"
      >
        <Box position="relative" h={{ base: "220px", md: "340px" }} bg="gray.900">
          <Image
            src={event.metadata.backdrop_url}
            alt={event.metadata.title}
            objectFit="cover"
            w="100%"
            h="100%"
            opacity="0.55"
          />

          <Stack
            position="absolute"
            inset="0"
            justify="end"
            p={{ base: "5", md: "8" }}
            color="white"
            bgGradient="linear(to-t, blackAlpha.800, transparent)"
          >
            <Badge colorPalette="green" alignSelf="start">
              {event.translated_status}
            </Badge>

            <Heading as="h1" size={{ base: "2xl", md: "4xl" }}>
              {event.title}
            </Heading>

            <Text fontSize={{ base: "md", md: "lg" }}>
              {event.formatted_datetime} • {event.address_title}
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="0">
          <Box p="6">
            <Image
              src={event.metadata.poster_url}
              alt={event.metadata.title}
              borderRadius="lg"
              w="100%"
              maxH="460px"
              objectFit="cover"
            />
          </Box>

          <Stack gap="5" p="6" gridColumn={{ base: "auto", md: "span 2" }}>
            <Box>
              <Heading as="h2" size="md" mb="2">
                Sinopse
              </Heading>

              <Text color="gray.700" lineHeight="tall">
                {event.metadata.overview || event.description}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Preço
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {event.formatted_price}
                </Text>
              </Box>

              <Box>
                <Text color="gray.500" fontSize="sm">
                  Capacidade
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {event.capacity}
                </Text>
              </Box>

              <Box>
                <Text color="gray.500" fontSize="sm">
                  Evento
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  #{event.id}
                </Text>
              </Box>
            </SimpleGrid>
          </Stack>
        </SimpleGrid>
      </Box>

      <DetailCard title="Dados do evento" details={eventDetails} />
      <DetailCard title="Dados do filme" details={metadataDetails} />
    </Stack>
  );
}
