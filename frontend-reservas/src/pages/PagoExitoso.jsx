import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import Swal from "sweetalert2";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function PagoExitoso() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔒 mejor que useState para evitar doble ejecución
  const procesado = useRef(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");

    if (!payment_id) {
      Swal.fire("Error", "No se recibió el pago", "error");
      navigate("/reservar");
      return;
    }

    if (procesado.current) return;
    procesado.current = true;

    async function confirmar() {
      try {
        await client.post("/pagos/confirmar", {
          payment_id,
        });

        await Swal.fire({
          title: "Pago aprobado 🎾",
          text: "Reserva confirmada correctamente",
          icon: "success",
          confirmButtonText: "Ver turnos",
        });

        // 🔥 REDIRECCIÓN FINAL
        navigate("/reservas"); // o "/reservar" si preferís

      } catch (error) {
        console.error("ERROR CONFIRMAR:", error);

        await Swal.fire(
          "Error",
          "El pago se realizó pero no pudimos confirmar la reserva",
          "error"
        );

        navigate("/reservar");
      }
    }

    confirmar();
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
        Procesando pago...
      </Typography>
    </Box>
  );
}