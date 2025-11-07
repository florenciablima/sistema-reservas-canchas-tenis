import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import client from "../api/client";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const locales = {
  "es-AR": es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Reservar() {
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState("");
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    async function cargarCanchas() {
      try {
        const res = await client.get("/canchas");
        console.log("Canchas disponibles:", res.data);
        setCanchas(res.data);
      } catch (error) {
        console.error("Error al cargar canchas:", error);
      }
    }
    cargarCanchas();
  }, []);

  useEffect(() => {
    if (!canchaSeleccionada) return;

    async function cargarDisponibilidad() {
      try {
        const res = await client.get(`/canchas/disponibilidad?cancha_id=${canchaSeleccionada}`);
        console.log("Disponibilidad recibida:", res.data);

        const eventosFormateados = res.data.map((item) => ({
          title: item.estado === "disponible" ? "Disponible" : "Ocupada",
          start: new Date(item.inicio),
          end: new Date(item.fin),
          backgroundColor: item.estado === "disponible" ? "green" : "red",
        }));

        console.log("Eventos formateados:", eventosFormateados);
        setEventos(eventosFormateados);
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error);
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada]);

  function manejarReserva(evento) {
    console.log("Evento seleccionado:", evento);
    if (evento.backgroundColor === "green") {
      alert(`Reservaste de ${format(evento.start, "HH:mm")} a ${format(evento.end, "HH:mm")}`);
    } else {
      alert("Este horario ya está ocupado.");
    }
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Reservar cancha
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="cancha-label">Seleccionar cancha</InputLabel>
        <Select
          labelId="cancha-label"
          value={canchaSeleccionada}
          label="Seleccionar cancha"
          onChange={(e) => setCanchaSeleccionada(e.target.value)}
        >
          {canchas.map((cancha) => (
            <MenuItem key={cancha.id} value={String(cancha.id)}>
              {cancha.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {canchaSeleccionada && (
        <>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.backgroundColor,
                color: "white",
                borderRadius: "5px",
                padding: "4px",
                border: "none",
              },
            })}
            onSelectEvent={manejarReserva}
          />

          {eventos.length === 0 && (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              No hay horarios disponibles para esta cancha.
            </Typography>
          )}
        </>
      )}
    </Container>
  );
}