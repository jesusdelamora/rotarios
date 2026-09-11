"use client";

import { Button } from "./ui";

export function PrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      Imprimir / Guardar PDF
    </Button>
  );
}
