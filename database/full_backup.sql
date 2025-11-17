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
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `cancha_id` (`cancha_id`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`cancha_id`) REFERENCES `canchas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,2,1,'2025-10-28','10:00:00','11:00:00','cancelada','2025-10-30 22:31:37'),(2,1,1,'2025-11-07','12:00:00','13:00:00','cancelada','2025-11-07 22:55:38'),(3,1,1,'2025-11-07','12:00:00','13:00:00','cancelada','2025-11-07 22:55:47'),(4,1,3,'2025-11-07','11:00:00','12:00:00','cancelada','2025-11-07 23:05:59'),(5,1,3,'2025-11-07','22:00:00','23:00:00','cancelada','2025-11-07 23:07:04'),(6,1,3,'2025-11-07','09:00:00','10:00:00','cancelada','2025-11-07 23:10:20'),(7,2,3,'2025-11-07','09:00:00','10:00:00','confirmada','2025-11-07 23:11:01'),(8,1,3,'2025-11-07','09:00:00','10:00:00','cancelada','2025-11-07 23:24:26'),(9,1,1,'2025-10-24','10:00:00','11:00:00','confirmada','2025-11-08 21:18:22'),(10,1,3,'2025-11-08','16:00:00','17:00:00','confirmada','2025-11-08 21:26:15'),(11,1,3,'2025-11-08','19:00:00','20:00:00','confirmada','2025-11-08 21:31:50'),(12,1,3,'2025-11-08','17:00:00','18:00:00','confirmada','2025-11-08 21:38:00'),(13,1,1,'2025-11-08','10:00:00','11:00:00','cancelada','2025-11-08 22:06:59'),(14,1,1,'2025-11-08','10:00:00','11:00:00','cancelada','2025-11-08 22:15:52'),(15,4,5,'2025-11-12','17:00:00','18:00:00','confirmada','2025-11-12 22:29:49'),(16,4,4,'2025-11-17','10:00:00','11:00:00','confirmada','2025-11-17 19:43:48');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@gmail.com','$2b$10$p/9HyqPBQgMDvGTEtSfdDehv.pK2sfUlp4Rr9zBWPX8meKeOT.IRG','admin','2025-10-30 22:10:33'),(2,'Rodolfo Lopez','rodolfolopez@gmail.com','$2b$10$Vmx1a4W/ZhbJvZETgNhDrOo8WzPIpQEk14O9nqGGPUy6gomjKvCsa','usuario','2025-10-30 22:23:15'),(3,'Carlos Irigoyen','carlosirigoyen@gmail.com','$2b$10$LtD/4Rn3hS0PULLTtq9aE.SPcvtnxTd0FVHvffPDPYW8ycHX0D6GK','usuario','2025-11-02 23:36:44'),(4,'Florencia Lima','florencialima@live.com','$2b$10$6.M4CdKczpVDnn8DNNV75.J1o8IUSyGVrHfZH/vR0NRZkCEYuLPNe','usuario','2025-11-12 22:14:53');
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

-- Dump completed on 2025-11-17 17:00:29
