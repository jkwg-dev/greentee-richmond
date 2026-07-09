"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FullMenu } from "@/components/layout/FullMenu";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

const FILTERS = ["All", "Offers", "Events", "News"];

/** Client-side chip filter, standing in for the News & Offers filter bar (docs §7). */
export function ChipFilterDemo() {
  const [active, setActive] = useState("All");
  return (
    <div className="flex flex-wrap gap-2.5">
      {FILTERS.map((label) => (
        <Chip
          key={label}
          active={active === label}
          onClick={() => setActive(label)}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}

/** Opens the FullMenu overlay from the desktop styleguide (it is hamburger-only in the header). */
export function FullMenuDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Open FullMenu
      </Button>
      <AnimatePresence>
        {open && <FullMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
