import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import client from "../api/client";
import Swal from "sweetalert2";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function PagoExitoso() {
  const location = useLocation();
  const [procesado, setProcesado] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");

    if (!payment_id) {
      Swal.fire("Error", "No se recibió el pago", "error");
      return;
    }

    // 🚫 evitar doble ejecución
    if (procesado) return;

    async function confirmar() {
      try {
        await client.post("/pagos/confirmar", {
          payment_id,
        });

        Swal.fire({
          title: "Pago aprobado",
          text: "Reserva confirmada correctamente",
          icon: "success",
          confirmButtonText: "OK",
        });

        setProcesado(true);

      } catch (error) {
        console.error("ERROR CONFIRMAR:", error);
        Swal.fire("Error", "No se pudo confirmar la reserva", "error");
      }
    }

    confirmar();
  }, [location, procesado]);

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress sx={{ mb: 2 }} />

      <Typography variant="h6">
        Procesando pago...
      </Typography>
    </Box>
  );
}