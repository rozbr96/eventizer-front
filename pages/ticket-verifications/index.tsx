import { useEffect, useRef, useState, type FormEvent } from "react";
import { Box, Button, Dialog, Field, Flex, Heading, Input, Portal, Stack, Table, Text } from "@chakra-ui/react";
import { FaCheck, FaQrcode } from "react-icons/fa";
import { type default as QrScannerType } from "qr-scanner";

import api, { type TicketVerification } from "@/lib/api";

const statusLabel = (succeed: boolean) => succeed ? "Sucesso" : "Falha";

const formattedDatetime = (datetime: string) => new Date(datetime).toLocaleString();

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function VerificationDialog({ onVerified }: { onVerified: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || code) return;

    let active = true;

    const startCamera = async () => {
      const { default: QrScanner } = await import("qr-scanner");

      if (!active || !videoRef.current) return;

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          setCode(result.data);
          scanner.stop();
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        },
      );

      scannerRef.current = scanner;
      await scanner.start();
    }

    startCamera().catch(() => {
      setCameraError("Não foi possível acessar a câmera.");
    });

    return () => {
      active = false;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    }
  }, [code, open]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (value) return;

    setCode("");
    setDocumentNumber("");
    setCameraError("");
    scannerRef.current?.destroy();
    scannerRef.current = null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!code || !documentNumber) return;

    setSubmitting(true);

    api.tickets.verify(code, documentNumber)
      .then(() => {
        handleOpenChange(false);
        onVerified();
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Dialog.Root open={open} onOpenChange={(change) => handleOpenChange(change.open)}>
      <Dialog.Trigger asChild>
        <Button colorPalette="blue">
          <FaQrcode />
          Iniciar verificação
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Verificar ingresso</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="4">
                {!code && (
                  <Box>
                    <Text color="gray.600" mb="3">
                      Aponte a câmera para o QR Code do ingresso.
                    </Text>

                    {cameraError ? (
                      <Text color="red.600">{cameraError}</Text>
                    ) : (
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        autoPlay
                        style={{
                          width: "100%",
                          maxHeight: "360px",
                          background: "black",
                          borderRadius: "0.375rem",
                        }}
                      />
                    )}
                  </Box>
                )}

                {code && (
                  <form id="ticket-verification-form" onSubmit={handleSubmit}>
                    <Stack gap="4">
                      <Field.Root>
                        <Field.Label>Código lido</Field.Label>
                        <Input value={code} readOnly />
                      </Field.Root>

                      <Field.Root required>
                        <Field.Label>Documento do titular</Field.Label>
                        <Input
                          value={documentNumber}
                          onChange={(event) => setDocumentNumber(onlyDigits(event.target.value))}
                          placeholder="Informe o documento"
                          inputMode="numeric"
                          required
                        />
                      </Field.Root>
                    </Stack>
                  </form>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.ActionTrigger>

              {code && (
                <Button type="submit" form="ticket-verification-form" colorPalette="green" loading={submitting}>
                  <FaCheck />
                  Verificar
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default function TicketVerifications() {
  const [ticketVerifications, setTicketVerifications] = useState<TicketVerification[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    api.tickets.verifications()
      .then((verifications) => {
        if (!active) return;

        setTicketVerifications(verifications);
        setFailed(false);
      })
      .catch(() => {
        if (!active) return;

        setFailed(true);
      })
      .finally(() => {
        if (!active) return;

        setLoading(false);
      });

    return () => {
      active = false;
    }
  }, [refreshKey]);

  const handleVerified = () => {
    setLoading(true);
    setRefreshKey((currentRefreshKey) => currentRefreshKey + 1);
  }

  return (
    <Stack gap="5">
      <Flex align="center" justify="space-between" gap="4">
        <Box>
          <Heading as="h1" size="lg" mb="2">
            Ingressos Validados
          </Heading>

          <Text color="gray.600">
            Histórico de tentativas de validação feitas pelo porteiro.
          </Text>
        </Box>

        <VerificationDialog onVerified={handleVerified} />
      </Flex>

      <Box overflowX="auto">
        <Table.Root css={{
          "& th:not(:first-of-type), & td:not(:first-of-type), & td[colspan]": {
            textAlign: "center",
          },
        }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Código do ingresso</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Documento usado</Table.ColumnHeader>
              <Table.ColumnHeader>Data da tentativa</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  Carregando verificações...
                </Table.Cell>
              </Table.Row>
            ) : failed ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  Não foi possível carregar as verificações.
                </Table.Cell>
              </Table.Row>
            ) : ticketVerifications.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  Nenhuma verificação registrada.
                </Table.Cell>
              </Table.Row>
            ) : (
              ticketVerifications.map((ticketVerification) => (
                <Table.Row key={`${ticketVerification.ticket.id}-${ticketVerification.when}`}>
                  <Table.Cell>{ticketVerification.ticket.code}</Table.Cell>
                  <Table.Cell>{statusLabel(ticketVerification.succeed)}</Table.Cell>
                  <Table.Cell>{ticketVerification.document_number}</Table.Cell>
                  <Table.Cell>{formattedDatetime(ticketVerification.when)}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
