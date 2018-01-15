-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: practica1_aw
-- ------------------------------------------------------
-- Server version	5.5.5-10.1.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answers_self`
--

DROP TABLE IF EXISTS `answers_self`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers_self` (
  `question` int(11) NOT NULL,
  `answer` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  PRIMARY KEY (`question`,`user`),
  KEY `fk_answer` (`answer`),
  KEY `fk_user` (`user`),
  KEY `fk_questionAnswer` (`question`,`answer`),
  CONSTRAINT `fk_answer` FOREIGN KEY (`answer`) REFERENCES `answers` (`idAnswer`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_question` FOREIGN KEY (`question`) REFERENCES `questions` (`idQuestion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_questionAnswer` FOREIGN KEY (`question`, `answer`) REFERENCES `answers` (`idQuestion`, `idAnswer`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `users` (`idUser`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers_self`
--

LOCK TABLES `answers_self` WRITE;
/*!40000 ALTER TABLE `answers_self` DISABLE KEYS */;
INSERT INTO `answers_self` VALUES (2,2,2),(2,3,3),(2,3,5),(2,4,1),(3,5,3),(3,6,1),(2,10,4);
/*!40000 ALTER TABLE `answers_self` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-15 12:36:52
