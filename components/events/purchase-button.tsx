import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { FaTicketAlt } from "react-icons/fa";

import api from "@/lib/api";

type PurchaseStatus = "idle" | "starting" | "started" | "failed";

export default function EventPurchaseButton({ eventId, fullWidth = false }: { eventId: number; fullWidth?: boolean }) {
  const [status, setStatus] = useState<PurchaseStatus>("idle");

  const starting = status === "starting";
  const started = status === "started";
  const failed = status === "failed";
  const label = failed ? "Tentar novamente" : started ? "Compra iniciada" : "Comprar ingresso";

  const startPurchase = async () => {
    setStatus("starting");

    try {
      await api.purchases.start(eventId);
      setStatus("started");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <Button
      colorPalette={failed ? "red" : "blue"}
      loading={starting}
      loadingText="Comprando"
      onClick={startPurchase}
      disabled={starting || started}
      size={fullWidth ? "md" : "sm"}
      variant="solid"
      width={fullWidth ? "100%" : "auto"}
    >
      <FaTicketAlt />
      {label}
    </Button>
  );
}
