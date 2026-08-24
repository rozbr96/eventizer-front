import { Box, Button, Container, Field, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { type FormEvent, useEffect, useState } from "react";

import EventDetail from "@/components/events/detail";
import CardPaymentForm, { type CardPaymentData, type CardPaymentErrors } from "@/components/purchases/card-payment-form";
import PixPaymentInfo from "@/components/purchases/pix-payment-info";
import api, { type Purchase } from "@/lib/api";

type PaymentMethod = "credit_card" | "debit_card" | "pix" | "money";
type PaymentStatus = "idle" | "submitting" | "success" | "error";

type PurchaseError = {
  purchaseId: number;
  message: string;
}

const paymentMethods: Array<{ label: string; value: PaymentMethod }> = [
  { label: "Crédito", value: "credit_card" },
  { label: "Débito", value: "debit_card" },
  { label: "Pix", value: "pix" },
  { label: "Dinheiro", value: "money" },
];

const emptyCardPayment: CardPaymentData = {
  cardNumber: "",
  cardHolderName: "",
  cardExpirationDate: "",
  cardCvv: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatMoney = (value: string) => {
  const cents = Number(onlyDigits(value));

  if (!cents) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

const parsePurchaseId = (id: string | string[] | undefined) => {
  const value = Array.isArray(id) ? id[0] : id;
  const purchaseId = Number(value);

  return Number.isInteger(purchaseId) && purchaseId > 0 ? purchaseId : null;
}

export default function Payment() {
  const router = useRouter();
  const purchaseId = router.isReady ? parsePurchaseId(router.query.id) : null;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<PurchaseError | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [cardPayment, setCardPayment] = useState<CardPaymentData>(emptyCardPayment);
  const [paidAmount, setPaidAmount] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [cardErrors, setCardErrors] = useState<CardPaymentErrors>({});
  const [moneyError, setMoneyError] = useState("");

  const loaded = purchase !== null && purchase.id === purchaseId;
  const failed = error !== null && error.purchaseId === purchaseId;
  const loading = router.isReady && purchaseId !== null && !loaded && !failed;
  const invalidPurchaseId = router.isReady && purchaseId === null;
  const submitting = status === "submitting";
  const pixKey = purchase ? `eventizer-purchase-${purchase.id}@pix` : "";

  const validateCardPayment = () => {
    const errors: CardPaymentErrors = {};
    const cardNumberDigits = onlyDigits(cardPayment.cardNumber);
    const expirationDigits = onlyDigits(cardPayment.cardExpirationDate);
    const cvvDigits = onlyDigits(cardPayment.cardCvv);
    const expirationMonth = Number(expirationDigits.slice(0, 2));
    const expirationYear = Number(`20${expirationDigits.slice(2)}`);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (cardNumberDigits.length < 13) errors.cardNumber = "Informe um número de cartão válido.";
    if (cardPayment.cardHolderName.trim().length < 3) errors.cardHolderName = "Informe o nome impresso no cartão.";
    if (expirationDigits.length !== 4 || expirationMonth < 1 || expirationMonth > 12) {
      errors.cardExpirationDate = "Informe a validade no formato MM/AA.";
    } else if (expirationYear < currentYear || (expirationYear === currentYear && expirationMonth < currentMonth)) {
      errors.cardExpirationDate = "Informe uma validade futura.";
    }
    if (cvvDigits.length < 3) errors.cardCvv = "Informe o CVV com 3 ou 4 dígitos.";

    setCardErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const validatePayment = () => {
    setMoneyError("");

    if (paymentMethod === "credit_card" || paymentMethod === "debit_card") return validateCardPayment();

    setCardErrors({});

    if (paymentMethod === "money" && Number(onlyDigits(paidAmount)) <= 0) {
      setMoneyError("Informe um valor pago maior que zero.");
      return false;
    }

    return true;
  }

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

  const payBody = () => {
    if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
      return {
        payment_method: paymentMethod,
        card: {
          number: onlyDigits(cardPayment.cardNumber),
          holder_name: cardPayment.cardHolderName.trim(),
          expiration_date: cardPayment.cardExpirationDate,
          cvv: onlyDigits(cardPayment.cardCvv),
        },
      };
    }

    if (paymentMethod === "pix") return { payment_method: paymentMethod, pix_key: pixKey };

    return { payment_method: paymentMethod, paid_amount: paidAmount, paid_amount_cents: Number(onlyDigits(paidAmount)) };
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!purchase) return;
    if (!validatePayment()) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    api.purchases.pay(purchase.id, payBody())
      .then((ticket) => {
        setStatus("success");
        router.push(`/tickets/${ticket.id}`);
      })
      .catch(() => {
        setStatus("error");
      });
  }

  const updateCardPayment = (value: CardPaymentData) => {
    setCardPayment(value);
    setCardErrors({});
    if (status === "error") setStatus("idle");
  }

  const updatePaidAmount = (value: string) => {
    setPaidAmount(formatMoney(value));
    setMoneyError("");
    if (status === "error") setStatus("idle");
  }

  if (!router.isReady || loading) {
    return (
      <Box minH="100vh" bg="gray.50" py={{ base: "6", md: "10" }}>
        <Container maxW="6xl">
          <Box borderWidth="1px" borderRadius="lg" p="8" bg="white">
            <Text color="gray.700">Carregando pagamento...</Text>
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
              <Stack gap="5">
                <Box>
                  <Heading as="h1" size="lg" mb="2">
                    Pagamento
                  </Heading>

                  <Text color="gray.600">
                    Escolha a forma de pagamento e preencha os dados necessários.
                  </Text>
                </Box>

                <Stack direction={{ base: "column", sm: "row" }} gap="3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.value}
                      type="button"
                      colorPalette={paymentMethod === method.value ? "blue" : "gray"}
                      variant={paymentMethod === method.value ? "solid" : "outline"}
                      onClick={() => {
                        setPaymentMethod(method.value);
                        setCardErrors({});
                        setMoneyError("");
                        if (status === "error") setStatus("idle");
                      }}
                      disabled={submitting}
                    >
                      {method.label}
                    </Button>
                  ))}
                </Stack>

                {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
                  <CardPaymentForm
                    value={cardPayment}
                    errors={cardErrors}
                    onChange={updateCardPayment}
                    disabled={submitting}
                  />
                )}

                {paymentMethod === "pix" && <PixPaymentInfo pixKey={pixKey} />}

                {paymentMethod === "money" && (
                  <Field.Root required invalid={Boolean(moneyError)}>
                    <Field.Label>Valor pago</Field.Label>
                    <Input
                      value={paidAmount}
                      onChange={(event) => updatePaidAmount(event.target.value)}
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                      disabled={submitting}
                    />
                    <Field.ErrorText>{moneyError}</Field.ErrorText>
                  </Field.Root>
                )}

                {status === "success" && (
                  <Text color="green.600" fontWeight="medium">
                    Pagamento enviado com sucesso.
                  </Text>
                )}

                {status === "error" && (
                  <Text color="red.600" fontWeight="medium">
                    Não foi possível enviar o pagamento.
                  </Text>
                )}

                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={submitting}
                  loadingText="Pagando"
                  alignSelf={{ base: "stretch", sm: "start" }}
                >
                  Pagar
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
