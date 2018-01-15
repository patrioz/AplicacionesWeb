
-- MySQL Script generated by MySQL Workbench

-- PRACTICA_1 - APLICACIONES WEB

-- AUTORES: PATRICIA ORTIZ Y VICTOR CHAMIZO


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;


--
-- DATABASE: `practica1_aw`
--

-- -----------------------------------------------------
-- Table `practica1_aw`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `idUser` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `date` DATE NOT NULL,
  `gender` TINYINT(4) NOT NULL,
  `score` INT(11) NOT NULL DEFAULT '0',
  `img` LONGBLOB,
  PRIMARY KEY (`idUser`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `practica1_aw`.`friends`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `friendship` (
  `user1` INT(11) NOT NULL,
  `user2` INT(11) NOT NULL,
  `request` TINYINT(4) NOT NULL DEFAULT '1',
  CONSTRAINT `fk_user1`
	FOREIGN KEY (`user1`) 
	REFERENCES `practica1_aw`.`users` (`idUser`)
	ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user2`
	FOREIGN KEY (`user2`)
	REFERENCES `practica1_aw`.`users` (`idUser`)
	ON DELETE CASCADE ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `practica1_aw`.`questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `questions` (
  `idQuestion` INT(11) NOT NULL AUTO_INCREMENT,
  `questionText` VARCHAR(45) NOT NULL,
  `cont` INT(11) NOT NULL, -- Para el apartado 3
  PRIMARY KEY(`idQuestion`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- -----------------------------------------------------
-- Table `practica1_aw`.`answers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `answers` (
  `idAnswer` INT(11) NOT NULL AUTO_INCREMENT,
  `idQuestion` INT(11) NOT NULL,
  `answerText` VARCHAR(45) NOT NULL,
  CONSTRAINT `fk_idQuestion`
	FOREIGN KEY (`idQuestion`) 
	REFERENCES `practica1_aw`.`questions` (`idQuestion`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(`idAnswer`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- -----------------------------------------------------
-- Table `practica1_aw`.`answers_self`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `answers_self` (
  `question` INT(11) NOT NULL,
  `answer` INT(11) NOT NULL,
  `user` INT(11) NOT NULL,
  CONSTRAINT `fk_question`
	FOREIGN KEY (`question`) 
	REFERENCES `practica1_aw`.`questions` (`idQuestion`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_answer`
	FOREIGN KEY ( `answer`) 
	REFERENCES `practica1_aw`.`answers` ( `idAnswer`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user`
	FOREIGN KEY (`user`) 
	REFERENCES `practica1_aw`.`users` (`idUser`)
	ON DELETE CASCADE ON UPDATE CASCADE,
   CONSTRAINT `fk_questionAnswer`
	FOREIGN KEY (`question`, `answer`) 
	REFERENCES `practica1_aw`.`answers` (`idQuestion`, `idAnswer`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(`question`,`user`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `practica1_aw`.`answers_friends`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `answers_friends` (
  `question` INT(11) NOT NULL,
  `userMe` INT(11) NOT NULL,
  `userFriend` INT(11) NOT NULL,
  `answer` TINYINT(1) NOT NULL,
  CONSTRAINT `fk_quest`
	FOREIGN KEY (`question`) 
	REFERENCES `practica1_aw`.`questions` (`idQuestion`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userMe`
	FOREIGN KEY (`userMe`) 
	REFERENCES `practica1_aw`.`users` (`idUser`)
	ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userFriend`
	FOREIGN KEY (`userFriend`)
	REFERENCES `practica1_aw`.`users` (`idUser`)
	ON DELETE CASCADE ON UPDATE CASCADE,
   CONSTRAINT `fk_questionFriend`
	FOREIGN KEY (`question`, `userFriend`) 
	REFERENCES `practica1_aw`.`answers_self` (`question`, `user`)
  ON DELETE CASCADE ON UPDATE CASCADE,
PRIMARY KEY(`question`,`userMe`, `userFriend`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;




/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;




