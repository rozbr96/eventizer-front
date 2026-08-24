import { Box, Button, Container, Field, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import EventDetail from "@/components/events/detail";
import api, { type Purchase } from "@/lib/api";

type PurchaseError = {
  purchaseId: number;
  message: string;
}

type PersonalInfoStatus = "idle" | "submitting" | "success" | "error";

const parsePurchaseId = (id: string | string[] | undefined) => {
  const value = Array.isArray(id) ? id[0] : id;
  const purchaseId = Number(value);

  return Number.isInteger(purchaseId) && purchaseId > 0 ? purchaseId : null;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatDocument = (value: string) => {
  return onlyDigits(value).slice(0, 14);
}

export default function SupplyPersonalInfo() {
  const router = useRouter();
  const purchaseId = router.isReady ? parsePurchaseId(router.query.id) : null;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [holder, setHolder] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [error, setError] = useState<PurchaseError | null>(null);
  const [status, setStatus] = useState<PersonalInfoStatus>("idle");

  const loaded = purchase !== null && purchase.id === purchaseId;
  const failed = error !== null && error.purchaseId === purchaseId;
  const loading = router.isReady && purchaseId !== null && !loaded && !failed;
  const invalidPurchaseId = router.isReady && purchaseId === null;
  const submitting = status === "submitting";

  useEffect(() => {
    if (purchaseId === null) return;

    let active = true;
    const cachedPurchase = api.purchases.getCached(purchaseId);
    const purchaseRequest = cachedPurchase ? Promise.resolve(cachedPurchase) : api.purchases.get(purchaseId);

    purchaseRequest
      .then((result) => {
        if (!active) return;

        setPurchase(result);
        setHolder(result.holder || "");
        setDocumentNumber(result.document_number || "");
      })
      .catch(() => {
        if (!active) return;

        setError({ purchaseId, message: "Não foi possível carregar a compra." });
      });

    return () => {
      active = false;
    }
  }, [purchaseId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!purchase) return;

    const trimmedHolder = holder.trim();
    const trimmedDocumentNumber = onlyDigits(documentNumber);

    if (!trimmedHolder || !trimmedDocumentNumber) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    api.purchases.supplyPersonalInfo(purchase.id, trimmedHolder, trimmedDocumentNumber)
      .then((result) => {
        setPurchase(result);
        setHolder(result.holder || trimmedHolder);
        setDocumentNumber(result.document_number || trimmedDocumentNumber);
        setStatus("success");
        router.push(`/purchases/${result.id}/payment`);
      })
      .catch(() => {
        setStatus("error");
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
    <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
      <Container maxW="6xl">
        <Stack gap="8">
          <form onSubmit={handleSubmit}>
            <Box borderWidth="1px" borderRadius="lg" p="6" bg="white">
              <Stack gap="4">
                <Box>
                  <Heading as="h1" size="lg" mb="2">
                    Dados do ingresso
                  </Heading>

                  <Text color="gray.600">
                    Informe os dados do titular que usará este ingresso.
                  </Text>
                </Box>

                <Field.Root>
                  <Field.Label>
                    Nome do titular
                  </Field.Label>

                  <Input
                    id="holder"
                    value={holder}
                    onChange={(event) => setHolder(event.target.value)}
                    placeholder="Nome completo"
                    mt="2"
                    disabled={submitting}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>
                    Documento
                  </Field.Label>

                  <Input
                    id="document"
                    value={documentNumber}
                    onChange={(event) => setDocumentNumber(formatDocument(event.target.value))}
                    placeholder="Somente números"
                    inputMode="numeric"
                    mt="2"
                    disabled={submitting}
                  />
                </Field.Root>

                {status === "success" && (
                  <Text color="green.600" fontWeight="medium">
                    Dados pessoais enviados com sucesso.
                  </Text>
                )}

                {status === "error" && (
                  <Text color="red.600" fontWeight="medium">
                    Informe o nome e documento do titular para continuar.
                  </Text>
                )}

                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={submitting}
                  loadingText="Enviando"
                  alignSelf={{ base: "stretch", sm: "start" }}
                >
                  Enviar dados
                </Button>
              </Stack>
            </Box>
          </form>

          <EventDetail event={purchase.event} />
        </Stack>
      </Container>
    </Box>
  );
}
