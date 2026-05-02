import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import Swal from "sweetalert2";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function PagoExitoso() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔒 evita doble ejecución (React Strict Mode)
  const procesado = useRef(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");

    // ❌ si no vino el pago
    if (!payment_id) {
      Swal.fire({
        title: "Error",
        text: "No se recibió información del pago",
        icon: "error",
      });

      navigate("/reservar");
      return;
    }

    // 🔒 evitar doble ejecución
    if (procesado.current) return;
    procesado.current = true;

    async function confirmarPago() {
      try {
        // 🔥 SOLO confirma el pago (NO crea reserva)
        await client.post("/pagos/confirmar", {
          payment_id,
        });

        await Swal.fire({
          title: "Pago aprobado 🎾",
          text: "Tu reserva fue confirmada correctamente",
          icon: "success",
          confirmButtonText: "Ver mis reservas",
        });

        navigate("/reservas");

      } catch (error) {
        console.error("ERROR CONFIRMAR:", error);

        await Swal.fire({
          title: "Pago recibido",
          text: "Pero hubo un problema al registrarlo. Contactá al club.",
          icon: "warning",
          confirmButtonText: "Ir a mis reservas",
        });

        navigate("/reservas");
      }
    }

    confirmarPago();

  }, [location, navigate]);

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
        Confirmando pago...
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Por favor esperá unos segundos
      </Typography>
    </Box>
  );
}