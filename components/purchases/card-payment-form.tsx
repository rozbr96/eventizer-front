import { Field, Input, SimpleGrid } from "@chakra-ui/react";

export type CardPaymentData = {
  cardNumber: string;
  cardHolderName: string;
  cardExpirationDate: string;
  cardCvv: string;
}

export type CardPaymentErrors = Partial<Record<keyof CardPaymentData, string>>;

type CardPaymentFormProps = {
  value: CardPaymentData;
  disabled?: boolean;
  errors?: CardPaymentErrors;
  onChange: (value: CardPaymentData) => void;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string) => {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

const formatExpirationDate = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const formatCvv = (value: string) => onlyDigits(value).slice(0, 3);

export default function CardPaymentForm({ value, disabled = false, errors = {}, onChange }: CardPaymentFormProps) {
  const update = (key: keyof CardPaymentData, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
      <Field.Root required invalid={Boolean(errors.cardNumber)}>
        <Field.Label>Número do cartão</Field.Label>
        <Input
          value={value.cardNumber}
          onChange={(event) => update("cardNumber", formatCardNumber(event.target.value))}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          disabled={disabled}
        />
        <Field.ErrorText>{errors.cardNumber}</Field.ErrorText>
      </Field.Root>

      <Field.Root required invalid={Boolean(errors.cardHolderName)}>
        <Field.Label>Nome no cartão</Field.Label>
        <Input
          value={value.cardHolderName}
          onChange={(event) => update("cardHolderName", event.target.value.toUpperCase())}
          placeholder="Nome completo"
          disabled={disabled}
        />
        <Field.ErrorText>{errors.cardHolderName}</Field.ErrorText>
      </Field.Root>

      <Field.Root required invalid={Boolean(errors.cardExpirationDate)}>
        <Field.Label>Validade</Field.Label>
        <Input
          value={value.cardExpirationDate}
          onChange={(event) => update("cardExpirationDate", formatExpirationDate(event.target.value))}
          placeholder="MM/AA"
          inputMode="numeric"
          disabled={disabled}
        />
        <Field.ErrorText>{errors.cardExpirationDate}</Field.ErrorText>
      </Field.Root>

      <Field.Root required invalid={Boolean(errors.cardCvv)}>
        <Field.Label>CVV</Field.Label>
        <Input
          value={value.cardCvv}
          onChange={(event) => update("cardCvv", formatCvv(event.target.value))}
          placeholder="123"
          inputMode="numeric"
          disabled={disabled}
        />
        <Field.ErrorText>{errors.cardCvv}</Field.ErrorText>
      </Field.Root>
    </SimpleGrid>
  );
}
