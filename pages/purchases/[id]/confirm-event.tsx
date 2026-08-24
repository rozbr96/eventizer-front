import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import EventDetail from "@/components/events/detail";
import api, { type Purchase } from "@/lib/api";

type PurchaseError = {
  purchaseId: number;
  message: string;
}

type ConfirmationState = {
  purchaseId: number;
  status: "submitting" | "success" | "error";
  message?: string;
}

const parsePurchaseId = (id: string | string[] | undefined) => {
  const value = Array.isArray(id) ? id[0] : id;
  const purchaseId = Number(value);

  return Number.isInteger(purchaseId) && purchaseId > 0 ? purchaseId : null;
}

export default function ConfirmEvent() {
  const router = useRouter();
  const purchaseId = router.isReady ? parsePurchaseId(router.query.id) : null;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<PurchaseError | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const loaded = purchase !== null && purchase.id === purchaseId;
  const failed = error !== null && error.purchaseId === purchaseId;
  const currentConfirmation = confirmation?.purchaseId === purchaseId ? confirmation : null;
  const confirming = currentConfirmation?.status === "submitting";
  const loading = router.isReady && purchaseId !== null && !loaded && !failed;
  const invalidPurchaseId = router.isReady && purchaseId === null;

  useEffect(() => {
    if (purchaseId === null) return;

    let active = true;
    const cachedPurchase = api.purchases.getCached(purchaseId);
    const purchaseRequest = cachedPurchase ? Promise.resolve(cachedPurchase) : api.purchases.get(purchaseId);

    purchaseRequest
      .then((result) => {
        if (!active) return;

        setPurchase(result);
      })
      .catch(() => {
        if (!active) return;

        setError({ purchaseId, message: "Não foi possível carregar a compra." });
      });

    return () => {
      active = false;
    }
  }, [purchaseId]);

  const handleConfirm = () => {
    if (!purchase) return;

    setConfirmation({ purchaseId: purchase.id, status: "submitting" });

    api.purchases.confirmEvent(purchase.id)
      .then(() => {
        setConfirmation({
          purchaseId: purchase.id,
          status: "success",
          message: "Evento confirmado com sucesso.",
        });
      })
      .catch(() => {
        setConfirmation({
          purchaseId: purchase.id,
          status: "error",
          message: "Não foi possível confirmar o evento.",
        });
      });
  }

  if (!router.isReady || loading) {
    return (
      <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
        <Container maxW="6xl">
          <Box borderWidth="1px" borderRadius="lg" p="8" bg="white">
            <Text color="gray.700">Carregando compra...</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  if (invalidPurchaseId || failed || !loaded) {
    return (
      <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
        <Container maxW="6xl">
          <Box borderWidth="1px" borderRadius="lg" p="8" bg="white">
            <Heading as="h1" size="lg" mb="2">
              Compra não encontrada
            </Heading>

            <Text color="gray.700">
              {invalidPurchaseId ? "Compra inválida." : error?.message || "Não foi possível encontrar esta compra."}
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pt={{ base: "6", md: "10" }} pb={{ base: "36", md: "32" }}>
      <Container maxW="6xl">
        <EventDetail event={purchase.event} />
      </Container>

      <Box
        position="fixed"
        insetInline="0"
        bottom="0"
        zIndex="sticky"
        px="4"
        py="4"
        bg="whiteAlpha.900"
        borderTopWidth="1px"
        backdropFilter="blur(10px)"
      >
        <Container maxW="6xl">
          <Stack
            direction={{ base: "column", sm: "row" }}
            gap="3"
            justify="center"
            align={{ base: "stretch", sm: "center" }}
          >
            {currentConfirmation?.message && (
              <Text
                color={currentConfirmation.status === "success" ? "green.600" : "red.600"}
                fontWeight="medium"
                textAlign={{ base: "center", sm: "right" }}
              >
                {currentConfirmation.message}
              </Text>
            )}

            <Button
              colorPalette="blue"
              size="lg"
              minW={{ base: "100%", sm: "240px" }}
              loading={confirming}
              loadingText="Confirmando"
              onClick={handleConfirm}
              disabled={confirming || currentConfirmation?.status === "success"}
            >
              Confirmar evento
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
