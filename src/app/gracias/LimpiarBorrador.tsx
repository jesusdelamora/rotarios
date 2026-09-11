"use client";

import { useEffect } from "react";
import { BORRADOR_KEY } from "../encuesta/EncuestaForm";

/** Al llegar a la página de gracias, la respuesta ya se guardó: borra el borrador local. */
export function LimpiarBorrador() {
  useEffect(() => {
    try {
      window.localStorage.removeItem(BORRADOR_KEY);
    } catch {
      /* sin almacenamiento */
    }
  }, []);
  return null;
}
