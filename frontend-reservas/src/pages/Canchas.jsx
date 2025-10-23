import React, { useEffect, useState } from "react";
import client from "../api/client";
import { Container, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Canchas(){
  const [canchas, setCanchas] = useState([]);

  useEffect(()=>{
    async function load(){
      try {
        const res = await client.get("/canchas");
        setCanchas(res.data);
      } catch (err) { console.error(err); }
    }
    load();
  }, []);

  return (
    <Container sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Canchas</Typography>
      <Grid container spacing={2}>
        {canchas.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.nombre}</Typography>
                <Typography>Tipo: {c.tipo}</Typography>
                <Typography>Precio x hora: ${c.precio_por_hora}</Typography>
                <Typography>Disponible: {c.disponible ? "Sí" : "No"}</Typography>
                <Button component={Link} to="/reservar" sx={{mt:1}} variant="contained">Reservar</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
