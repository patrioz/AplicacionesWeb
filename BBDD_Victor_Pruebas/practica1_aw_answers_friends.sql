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
-- Table structure for table `answers_friends`
--

DROP TABLE IF EXISTS `answers_friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers_friends` (
  `question` int(11) NOT NULL,
  `userMe` int(11) NOT NULL,
  `userFriend` int(11) NOT NULL,
  `answer` tinyint(1) NOT NULL,
  PRIMARY KEY (`question`,`userMe`,`userFriend`),
  KEY `fk_userMe` (`userMe`),
  KEY `fk_userFriend` (`userFriend`),
  KEY `fk_questionFriend` (`question`,`userFriend`),
  CONSTRAINT `fk_quest` FOREIGN KEY (`question`) REFERENCES `questions` (`idQuestion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_questionFriend` FOREIGN KEY (`question`, `userFriend`) REFERENCES `answers_self` (`question`, `user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userFriend` FOREIGN KEY (`userFriend`) REFERENCES `users` (`idUser`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userMe` FOREIGN KEY (`userMe`) REFERENCES `users` (`idUser`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers_friends`
--

LOCK TABLES `answers_friends` WRITE;
/*!40000 ALTER TABLE `answers_friends` DISABLE KEYS */;
INSERT INTO `answers_friends` VALUES (2,1,2,0),(2,1,3,1),(2,1,4,1),(2,1,5,1);
/*!40000 ALTER TABLE `answers_friends` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-15 12:36:53
