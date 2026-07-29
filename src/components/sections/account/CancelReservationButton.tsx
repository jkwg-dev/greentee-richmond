"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { BookingReservation } from "@/types/booking";
import { CancelDialog } from "./CancelDialog";

/**
 * The detail page's Cancel entry point (booking.md §14.2): a client leaf over
 * the server-rendered detail that opens the §14 dialog. A completed cancel
 * refreshes the route on close so the detail re-renders in its cancelled state;
 * the refund outcome itself was already shown in the dialog's result view from
 * the response. A plain dismiss (Keep Reservation) refreshes nothing.
 */
export function CancelReservationButton({
  reservation,
  roomName,
}: {
  reservation: BookingReservation;
  roomName: string;
}) {
  const [open, setOpen] = useState(false);
  const changed = useRef(false);
  const router = useRouter();

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Cancel
      </Button>
      {open && (
        <CancelDialog
          reservation={reservation}
          roomName={roomName}
          onCancelled={() => {
            changed.current = true;
          }}
          onClose={() => {
            setOpen(false);
            if (changed.current) {
              changed.current = false;
              router.refresh();
            }
          }}
        />
      )}
    </>
  );
}
