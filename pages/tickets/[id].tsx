import { Badge, Box, Container, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import EventDetail from "@/components/events/detail";
import TicketQrCode from "@/components/tickets/ticket-qr-code";
import api, { type Ticket } from "@/lib/api";

type TicketError = {
  ticketId: number;
  message: string;
}

type DetailItem = {
  label: string;
  value: string | number | boolean | null | undefined;
}

const parseTicketId = (id: string | string[] | undefined) => {
  const value = Array.isArray(id) ? id[0] : id;
  const ticketId = Number(value);

  return Number.isInteger(ticketId) && ticketId > 0 ? ticketId : null;
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
  );
}

export default function TicketPage() {
  const router = useRouter();
  const ticketId = router.isReady ? parseTicketId(router.query.id) : null;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<TicketError | null>(null);

  const loaded = ticket !== null && ticket.id === ticketId;
  const failed = error !== null && error.ticketId === ticketId;
  const loading = router.isReady && ticketId !== null && !loaded && !failed;
  const invalidTicketId = router.isReady && ticketId === null;

  useEffect(() => {
    if (ticketId === null) return;

    let active = true;
    const cachedTicket = api.tickets.getCached(ticketId);
    const ticketRequest = cachedTicket ? Promise.resolve(cachedTicket) : api.tickets.get(ticketId);

    ticketRequest
      .then((result) => {
        if (!active) return;

        setTicket(result);
      })
      .catch(() => {
        if (!active) return;

        setError({ ticketId, message: "Não foi possível carregar o ingresso." });
      });

    return () => {
      active = false;
    }
  }, [ticketId]);

  if (!router.isReady || loading) {
    return (
      <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
        <Container maxW="6xl">
          <Box borderWidth="1px" borderRadius="lg" p="8" bg="white">
            <Text color="gray.700">Carregando ingresso...</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  if (invalidTicketId || failed || !loaded) {
    return (
      <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
        <Container maxW="6xl">
          <Box borderWidth="1px" borderRadius="lg" p="8" bg="white">
            <Heading as="h1" size="lg" mb="2">
              Ingresso não encontrado
            </Heading>

            <Text color="gray.700">
              {invalidTicketId ? "Ingresso inválido." : error?.message || "Não foi possível encontrar este ingresso."}
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  const ticketDetails = [
    { label: "Titular", value: ticket.holder },
    { label: "Consumido", value: ticket.consumed },
  ];

  const purchaseDetails = [
    { label: "Compra", value: `#${ticket.purchase.id}` },
    { label: "Status", value: ticket.purchase.status },
    { label: "Titular", value: ticket.purchase.holder },
    { label: "Cliente", value: ticket.purchase.client.name },
    { label: "Cliente ID", value: ticket.purchase.client_id },
    { label: "Evento ID", value: ticket.purchase.event_id },
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
      <Container maxW="6xl">
        <Stack gap="8">
          <Box borderWidth="1px" borderRadius="lg" p="6" bg="white">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="8" alignItems="center">
              <Stack gap="4">
                <Badge colorPalette={ticket.consumed ? "red" : "green"} alignSelf="start">
                  {ticket.consumed ? "Consumido" : "Disponível"}
                </Badge>

                <Box>
                  <Heading as="h1" size="xl" mb="2">
                    Ingresso
                  </Heading>

                  <Text color="gray.600">
                    Apresente este QR Code na entrada do evento.
                  </Text>
                </Box>

                <DetailCard title="Dados do ingresso" details={ticketDetails} />
              </Stack>

              <TicketQrCode code={ticket.code} />
            </SimpleGrid>
          </Box>

          <DetailCard title="Dados da compra" details={purchaseDetails} />
          <EventDetail event={ticket.event} />
        </Stack>
      </Container>
    </Box>
  );
}
