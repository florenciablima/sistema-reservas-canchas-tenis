import React, { useEffect, useState, useContext } from "react";
import client from "../api/client";
import { AuthContext } from "../contexts/AuthContext";
import { Container, Typography, Card, CardContent } from "@mui/material";

export default function MisReservas() {
  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await client.get(`/reservas/usuario/${user.id}`);
        setReservas(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [user]);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>Mis Reservas</Typography>
      {reservas.map(r => (
        <Card key={r.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Cancha: {r.cancha_id}</Typography>
            <Typography>Fecha: {r.fecha}</Typography>
            <Typography>Horario: {r.hora_inicio} - {r.hora_fin}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}