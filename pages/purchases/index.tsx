import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Badge, Box, Button, Dialog, Heading, Portal, Stack, Table, Text } from "@chakra-ui/react";
import { FaEye, FaTicketAlt } from "react-icons/fa";

import Pagination from "@/components/ui/pagination";
import api, { type Purchase } from "@/lib/api";
import { type PaginatedPurchases } from "@/lib/api/purchases";

const statusLabel = (status: string) => {
  return {
    done: "Concluída",
    started: "Iniciada",
    event_confirmed: "Evento confirmado",
    personal_info_supplied: "Dados informados",
  }[status] || status;
}

const statusColor = (status: string) => status === "done" ? "green" : "gray";

const parsePage = (page: string | string[] | undefined) => {
  const value = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(value);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function TicketDialog({ purchase }: { purchase: Purchase }) {
  const ticket = purchase.ticket;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" colorPalette="blue">
          <FaTicketAlt />
          Ver ingresso
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Ingresso da compra #{purchase.id}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {ticket ? (
                <Stack gap="3">
                  <Text><strong>Código:</strong> {ticket.code}</Text>
                  <Text><strong>Titular:</strong> {ticket.holder}</Text>
                  <Text><strong>Documento:</strong> {ticket.document_number}</Text>
                  <Text><strong>Consumido:</strong> {ticket.consumed ? "Sim" : "Não"}</Text>
                </Stack>
              ) : (
                <Text color="gray.600">
                  A compra está concluída, mas os dados do ingresso ainda não vieram na listagem.
                </Text>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              {ticket && (
                <Button asChild colorPalette="blue">
                  <Link href={`/tickets/${ticket.id}`}>
                    <FaEye />
                    Abrir página do ingresso
                  </Link>
                </Button>
              )}

              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Fechar</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default function Purchases() {
  const router = useRouter();
  const page = router.isReady ? parsePage(router.query.page) : 1;
  const requestKey = String(page);
  const [purchases, setPurchases] = useState<PaginatedPurchases | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [failedKey, setFailedKey] = useState("");

  const loaded = purchases !== null && loadedKey === requestKey;
  const failed = failedKey === requestKey;
  const loading = router.isReady && !loaded && !failed;

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;

    api.purchases.list({ page })
      .then((result) => {
        if (!active) return;

        setPurchases(result);
        setLoadedKey(requestKey);
      })
      .catch(() => {
        if (!active) return;

        setFailedKey(requestKey);
      });

    return () => {
      active = false;
    }
  }, [page, requestKey, router.isReady]);

  const tableContent = () => {
    if (loading || !purchases) {
      return (
        <Table.Row>
          <Table.Cell colSpan={6}>Carregando compras...</Table.Cell>
        </Table.Row>
      );
    }

    if (failed) {
      return (
        <Table.Row>
          <Table.Cell colSpan={6}>Não foi possível carregar as compras.</Table.Cell>
        </Table.Row>
      );
    }

    if (purchases.items.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={6}>Nenhuma compra encontrada.</Table.Cell>
        </Table.Row>
      );
    }

    return purchases.items.map((purchase) => (
      <Table.Row key={purchase.id}>
        <Table.Cell>#{purchase.id}</Table.Cell>
        <Table.Cell>{purchase.event.title}</Table.Cell>
        <Table.Cell>
          <Badge colorPalette={statusColor(purchase.status)}>
            {statusLabel(purchase.status)}
          </Badge>
        </Table.Cell>
        <Table.Cell>{purchase.holder || "Não informado"}</Table.Cell>
        <Table.Cell>{purchase.document_number || "Não informado"}</Table.Cell>
        <Table.Cell>
          {purchase.status === "done" ? (
            <TicketDialog purchase={purchase} />
          ) : (
            <Button size="sm" variant="outline" disabled>
              Compra pendente
            </Button>
          )}
        </Table.Cell>
      </Table.Row>
    ));
  }

  return (
    <Stack gap="5">
      <Box>
        <Heading as="h1" size="lg" mb="2">
          Minhas Compras
        </Heading>

        <Text color="gray.600">
          Acompanhe suas compras e acesse os ingressos quando disponíveis.
        </Text>
      </Box>

      <Box overflowX="auto">
        <Table.Root css={{
          "& th:not(:first-of-type), & td:not(:first-of-type), & td[colspan]": {
            textAlign: "center",
          },
        }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Compra</Table.ColumnHeader>
              <Table.ColumnHeader>Evento</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Titular</Table.ColumnHeader>
              <Table.ColumnHeader>Documento</Table.ColumnHeader>
              <Table.ColumnHeader>Ações</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tableContent()}
          </Table.Body>
        </Table.Root>
      </Box>

      {purchases && (
        <Pagination
          page={purchases.page}
          totalPages={purchases.total_pages}
          totalCount={purchases.total_count}
          getPageHref={(page) => `/purchases?page=${page}`}
        />
      )}
    </Stack>
  );
}
