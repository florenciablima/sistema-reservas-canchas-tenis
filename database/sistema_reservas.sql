-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_reservas
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `canchas`
--

DROP TABLE IF EXISTS `canchas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canchas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tipo` enum('polvo','cemento','sintetico') NOT NULL,
  `precio_hora` decimal(8,2) DEFAULT '0.00',
  `disponible` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canchas`
--

LOCK TABLES `canchas` WRITE;
/*!40000 ALTER TABLE `canchas` DISABLE KEYS */;
INSERT INTO `canchas` VALUES (1,'Cancha 1','sintetico',3200.00,1),(2,'Cancha 2','polvo',2000.00,1),(3,'Cancha 3','sintetico',3200.00,1),(4,'Cancha 4','cemento',1800.00,1),(5,'Cancha 5','sintetico',3200.00,1);
/*!40000 ALTER TABLE `canchas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `reserva_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo` varchar(20) DEFAULT 'manual',
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_pago` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,2,34,3200.00,'manual','pagado','2026-05-01 22:51:21',NULL),(2,2,35,2000.00,'efectivo','pendiente','2026-05-02 00:10:42',NULL),(3,2,36,2000.00,'efectivo','pendiente','2026-05-02 00:11:17',NULL),(4,2,37,3200.00,'manual','pendiente','2026-05-02 00:18:09',NULL),(5,2,38,1800.00,'manual','pendiente','2026-05-02 02:30:21',NULL),(6,2,39,1800.00,'manual','pendiente','2026-05-02 02:30:26',NULL),(7,3,40,3200.00,'online','pendiente','2026-05-02 18:17:18',NULL),(8,3,41,3200.00,'manual','pendiente','2026-05-02 18:23:46',NULL),(9,3,42,3200.00,'manual','pendiente','2026-05-02 18:30:31',NULL),(10,3,43,3200.00,'online','pagado','2026-05-02 18:30:55','2026-05-02 18:54:26'),(11,4,44,2000.00,'manual','pendiente','2026-05-02 18:38:44',NULL),(12,4,45,3200.00,'online','pendiente','2026-05-02 18:39:08',NULL),(13,5,46,1800.00,'online','pagado','2026-05-02 18:46:10',NULL),(14,5,47,3200.00,'manual','pagado','2026-05-02 19:02:28','2026-05-02 19:03:10');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `cancha_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','finalizada') DEFAULT 'pendiente',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` varchar(20) DEFAULT 'pendiente',
  `pagada` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `cancha_id` (`cancha_id`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`cancha_id`) REFERENCES `canchas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,2,1,'2025-10-28','10:00:00','11:00:00','cancelada','2025-10-30 22:31:37','pendiente',0),(2,1,1,'2025-11-07','12:00:00','13:00:00','cancelada','2025-11-07 22:55:38','pendiente',0),(3,1,1,'2025-11-07','12:00:00','13:00:00','cancelada','2025-11-07 22:55:47','pendiente',0),(4,1,3,'2025-11-07','11:00:00','12:00:00','cancelada','2025-11-07 23:05:59','pendiente',0),(5,1,3,'2025-11-07','22:00:00','23:00:00','cancelada','2025-11-07 23:07:04','pendiente',0),(6,1,3,'2025-11-07','09:00:00','10:00:00','cancelada','2025-11-07 23:10:20','pendiente',0),(7,2,3,'2025-11-07','09:00:00','10:00:00','confirmada','2025-11-07 23:11:01','pendiente',0),(8,1,3,'2025-11-07','09:00:00','10:00:00','cancelada','2025-11-07 23:24:26','pendiente',0),(9,1,1,'2025-10-24','10:00:00','11:00:00','confirmada','2025-11-08 21:18:22','pendiente',0),(10,1,3,'2025-11-08','16:00:00','17:00:00','confirmada','2025-11-08 21:26:15','pendiente',0),(11,1,3,'2025-11-08','19:00:00','20:00:00','confirmada','2025-11-08 21:31:50','pendiente',0),(12,1,3,'2025-11-08','17:00:00','18:00:00','confirmada','2025-11-08 21:38:00','pendiente',0),(13,1,1,'2025-11-08','10:00:00','11:00:00','cancelada','2025-11-08 22:06:59','pendiente',0),(14,1,1,'2025-11-08','10:00:00','11:00:00','cancelada','2025-11-08 22:15:52','pendiente',0),(15,4,5,'2025-11-12','17:00:00','18:00:00','confirmada','2025-11-12 22:29:49','pendiente',0),(16,4,4,'2025-11-17','10:00:00','11:00:00','confirmada','2025-11-17 19:43:48','pendiente',0),(17,2,2,'2026-04-09','09:00:00','10:00:00','confirmada','2026-04-10 00:17:15','pendiente',0),(18,2,5,'2026-04-09','13:00:00','14:00:00','confirmada','2026-04-10 00:17:47','pendiente',0),(19,2,2,'2026-04-09','08:00:00','09:00:00','confirmada','2026-04-10 00:29:50','pendiente',0),(20,2,4,'2026-04-09','19:00:00','20:00:00','confirmada','2026-04-10 00:41:55','pendiente',0),(21,2,3,'2026-04-13','10:00:00','11:00:00','cancelada','2026-04-10 00:52:42','pendiente',0),(22,2,3,'2026-04-13','18:00:00','19:00:00','confirmada','2026-04-10 22:48:38','pendiente',0),(23,1,3,'2026-04-10','08:00:00','09:00:00','confirmada','2026-04-10 22:53:11','pendiente',0),(24,2,3,'2026-04-10','11:00:00','12:00:00','confirmada','2026-04-10 22:56:16','pendiente',0),(25,1,4,'2026-04-16','10:00:00','11:00:00','confirmada','2026-04-10 23:28:18','pendiente',0),(26,2,1,'2026-04-11','09:00:00','10:00:00','confirmada','2026-04-11 18:19:03','pendiente',0),(27,2,1,'2026-04-11','08:00:00','09:00:00','confirmada','2026-04-11 18:19:13','pendiente',0),(28,2,5,'2026-04-14','18:00:00','19:00:00','confirmada','2026-04-11 18:23:28','pendiente',0),(29,2,1,'2026-04-13','18:00:00','19:00:00','confirmada','2026-04-11 23:22:08','pendiente',0),(30,2,3,'2026-04-15','11:00:00','12:00:00','confirmada','2026-04-11 23:34:19','pendiente',0),(31,2,2,'2026-04-22','20:00:00','21:00:00','confirmada','2026-04-15 22:08:44','pendiente',1),(32,2,1,'2026-04-21','16:00:00','17:00:00','confirmada','2026-04-15 22:19:25','pendiente',1),(33,1,4,'2026-04-15','09:00:00','10:00:00','confirmada','2026-04-15 23:45:55','pendiente',0),(34,2,1,'2026-05-01','21:00:00','22:00:00','confirmada','2026-05-01 22:51:21','pendiente',0),(35,2,2,'2026-05-02','18:00:00','19:00:00','confirmada','2026-05-02 00:10:42','pendiente',0),(36,2,2,'2026-05-02','19:00:00','20:00:00','confirmada','2026-05-02 00:11:17','pendiente',0),(37,2,5,'2026-05-13','18:00:00','19:00:00','confirmada','2026-05-02 00:18:09','pendiente',0),(38,2,4,'2026-05-06','17:00:00','18:00:00','confirmada','2026-05-02 02:30:21','pendiente',0),(39,2,4,'2026-05-06','18:00:00','19:00:00','confirmada','2026-05-02 02:30:26','pendiente',0),(40,3,3,'2026-05-04','19:00:00','20:00:00','confirmada','2026-05-02 18:17:18','pendiente',0),(41,3,1,'2026-05-02','09:00:00','10:00:00','confirmada','2026-05-02 18:23:46','pendiente',0),(42,3,1,'2026-05-02','21:00:00','22:00:00','confirmada','2026-05-02 18:30:31','pendiente',0),(43,3,1,'2026-05-14','13:00:00','14:00:00','confirmada','2026-05-02 18:30:55','pendiente',0),(44,4,2,'2026-05-02','21:00:00','22:00:00','confirmada','2026-05-02 18:38:44','pendiente',0),(45,4,3,'2026-05-03','11:00:00','12:00:00','confirmada','2026-05-02 18:39:08','pendiente',0),(46,5,4,'2026-05-02','21:00:00','22:00:00','confirmada','2026-05-02 18:46:10','pendiente',0),(47,5,3,'2026-05-02','20:00:00','21:00:00','confirmada','2026-05-02 19:02:28','pendiente',0);
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@gmail.com','$2b$10$p/9HyqPBQgMDvGTEtSfdDehv.pK2sfUlp4Rr9zBWPX8meKeOT.IRG','admin','2025-10-30 22:10:33'),(2,'Rodolfo Lopez','rodolfolopez@gmail.com','$2b$10$Vmx1a4W/ZhbJvZETgNhDrOo8WzPIpQEk14O9nqGGPUy6gomjKvCsa','usuario','2025-10-30 22:23:15'),(3,'Carlos Irigoyen','carlosirigoyen@gmail.com','$2b$10$LtD/4Rn3hS0PULLTtq9aE.SPcvtnxTd0FVHvffPDPYW8ycHX0D6GK','usuario','2025-11-02 23:36:44'),(4,'Florencia Lima','florencialima@live.com','$2b$10$6.M4CdKczpVDnn8DNNV75.J1o8IUSyGVrHfZH/vR0NRZkCEYuLPNe','usuario','2025-11-12 22:14:53'),(5,'Micaela Quintana','micaquintana@gmail.com','$2b$10$GjHiBnxzKmctAZ4104IuheichreBsFuRLopVJOIafSSPblCf4XFE.','usuario','2026-05-02 18:45:55');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-02 16:35:45
