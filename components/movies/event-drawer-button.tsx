import { useState, type FormEvent } from "react";
import { Button, CloseButton, Drawer, Field, Image, Input, Portal, Stack, Text, Textarea } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaCalendarPlus } from "react-icons/fa";

import { toaster } from "@/components/ui/toaster";
import api, { type EventCreationInput, type Movie } from "@/lib/api";

const formatCents = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const minDatetime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function MovieEventDrawerButton({ movie }: { movie: Movie }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [priceInCents, setPriceInCents] = useState(0);

  const handlePriceChange = (value: string) => {
    setPriceInCents(Number(digitsOnly(value) || 0));
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const datetime = formData.get("datetime")?.toString() || "";
    const datetimeInput = event.currentTarget.elements.namedItem("datetime") as HTMLInputElement | null;
    const selectedDatetime = new Date(datetime);

    if (selectedDatetime < new Date()) {
      datetimeInput?.setCustomValidity("Selecione uma data e horário futuros.");
      event.currentTarget.reportValidity();
      datetimeInput?.setCustomValidity("");
      return;
    }

    const capacity = Math.max(1, Number(formData.get("capacity") || 1));

    const eventInput: EventCreationInput = {
      title: formData.get("title")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      datetime: new Date(datetime).toISOString(),
      address: formData.get("address")?.toString() || "",
      address_title: formData.get("address_title")?.toString() || "",
      capacity,
      price_in_cents: Math.max(0, priceInCents),
      metadata: movie,
    };

    setSubmitting(true);

    api.events.create(eventInput)
      .then((createdEvent) => {
        toaster.create({
          title: "Evento criado",
          description: "O evento foi criado com sucesso.",
          type: "success",
          closable: true,
        });

        setOpen(false);
        router.push(`/events?page=1&created=${createdEvent.id}`);
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Drawer.Root size="lg" open={open} onOpenChange={(change) => setOpen(change.open)}>
      <Drawer.Trigger asChild>
        <Button colorPalette="green" size="sm">
          <FaCalendarPlus />
          Criar Evento
        </Button>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />

        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Criar evento para {movie.title}</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <Stack gap="4">
                {movie.poster_url && (
                  <Image src={movie.poster_url} alt={movie.title} maxH="360px" objectFit="cover" borderRadius="md" />
                )}

                <Text color="gray.600">{movie.overview || "Sem sinopse disponível."}</Text>

                <form id={`create-event-${movie.id}`} onSubmit={handleSubmit}>
                  <Stack gap="4">
                    <Field.Root required>
                      <Field.Label>Título do evento</Field.Label>
                      <Input name="title" defaultValue={movie.title} required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Descrição</Field.Label>
                      <Textarea name="description" defaultValue={movie.overview} required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Data e horário</Field.Label>
                      <Input name="datetime" type="datetime-local" min={minDatetime()} required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Nome do local</Field.Label>
                      <Input name="address_title" placeholder="Cinema Central" required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Endereço</Field.Label>
                      <Input name="address" placeholder="Rua, número, bairro" required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Capacidade</Field.Label>
                      <Input name="capacity" type="number" inputMode="numeric" min="1" step="1" required />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Preço em R$</Field.Label>
                      <Input
                        name="price"
                        inputMode="numeric"
                        minLength={1}
                        value={formatCents(priceInCents)}
                        onChange={(event) => handlePriceChange(event.target.value)}
                        required
                      />
                    </Field.Root>
                  </Stack>
                </form>
              </Stack>
            </Drawer.Body>

            <Drawer.Footer>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>

              <Button type="submit" form={`create-event-${movie.id}`} colorPalette="blue" loading={submitting}>
                Criar Evento
              </Button>
            </Drawer.Footer>

            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
