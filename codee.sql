CREATE DATABASE  IF NOT EXISTS `quizz` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quizz`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: quizz
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT '',
  `password` varchar(255) DEFAULT '',
  `oauth_id` varchar(255) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `provider` enum('GOOGLE','FACEBOOK','USER') DEFAULT 'USER',
  `user` bigint DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT '0',
  `role` enum('USER','EDITER','ADMIN') DEFAULT 'USER',
  `verification_token` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `token_expiry` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  CONSTRAINT `account_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'john.doe@example.com','hashed_password_1','','2023-01-01 10:00:00','USER',1,1,'USER','','2025-04-19 14:03:51'),(2,'jane.smith@example.com','hashed_password_2','','2023-01-02 11:30:00','USER',2,1,'USER','','2025-04-19 14:03:51'),(3,'alex.nguyen@example.com','','google_123456','2023-01-03 09:15:00','GOOGLE',3,1,'USER','','2025-04-19 14:03:51'),(4,'sarah.lee@example.com','hashed_password_4','','2023-01-04 14:20:00','USER',4,1,'USER','','2025-04-19 14:03:51'),(5,'mike.tran@example.com','','facebook_789012','2023-01-05 16:45:00','FACEBOOK',5,1,'USER','','2025-04-19 14:03:51'),(6,'emily.pham@example.com','hashed_password_6','','2023-01-06 08:30:00','USER',6,0,'USER','','2025-04-19 14:03:51'),(7,'david.hoang@example.com','hashed_password_7','','2023-01-07 12:10:00','USER',7,1,'USER','','2025-04-19 14:03:51'),(8,'sophie.vo@example.com','','google_345678','2023-01-08 17:25:00','GOOGLE',8,1,'USER','','2025-04-19 14:03:51'),(9,'robert.le@example.com','hashed_password_9','','2023-01-09 13:40:00','USER',9,1,'USER','','2025-04-19 14:03:51'),(10,'lisa.wong@example.com','','facebook_901234','2023-01-10 10:55:00','FACEBOOK',10,1,'USER','','2025-04-19 14:03:51'),(11,'nmcuongg2004@gmail.com','','','2025-04-12 23:25:38','GOOGLE',14,0,'USER','','2025-04-19 14:03:51'),(12,'ngcuong1112001@gmail.com','','','2025-04-14 09:17:55','GOOGLE',15,0,'USER','','2025-04-19 14:03:51'),(13,'22110015@student.hcmute.edu.vn','','','2025-04-17 09:16:10','GOOGLE',18,0,'USER','','2025-04-19 14:03:51'),(14,'1','$2b$10$UaymIU59kQ6D02j789UwP.aXZe14xW9G3owHSa9XOOY9qc3mFx.bC','','2025-04-18 21:18:18','USER',20,1,'USER','','2025-04-19 14:03:51'),(20,'ngcuong1182004@gmail.com','$2b$10$RJ6.qdzJItqcdnKNA7gCMul1V2OCMcD7HINsqo3A7dv58RFt3KEku','','2025-04-19 19:38:02','USER',28,1,'USER',NULL,NULL),(21,'ngcuong1182004@gmail.com','','','2025-04-22 21:39:32','GOOGLE',28,0,'USER','','2025-04-22 21:39:32');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `desctiption` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Academic','Quizzes for academic subjects'),(2,'Entertainment','Fun quizzes for entertainment'),(3,'Professional','Quizzes for professional skills'),(4,'Personality','Tests to discover personality traits'),(5,'Knowledge','General knowledge quizzes'),(6,'Education','Educational quizzes for students'),(7,'Language','Language learning quizzes'),(8,'Technical','Technical and specialized quizzes'),(9,'Health','Health and wellness quizzes'),(10,'Trivia','Miscellaneous trivia quizzes');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user` bigint DEFAULT NULL,
  `quiz` bigint DEFAULT NULL,
  `message` text,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `quiz` (`quiz`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,2,1,'I really enjoyed this quiz!'),(2,3,1,'Some questions were quite challenging.'),(3,4,1,'Looking forward to more quizzes like this.'),(4,5,2,'Great science questions.'),(5,6,3,'I learned a lot about history from this quiz.'),(6,7,4,'The geography questions were interesting.'),(7,8,5,'Would love to see more literature quizzes.'),(8,9,6,'The programming questions were spot on.'),(9,10,7,'Fun pop culture references!'),(10,1,8,'The math problems were well thought out.'),(12,28,2,'aaa'),(13,28,2,'hi hi haha');
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcard`
--

DROP TABLE IF EXISTS `flashcard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `question` bigint DEFAULT NULL,
  `method_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcard`
--

LOCK TABLES `flashcard` WRITE;
/*!40000 ALTER TABLE `flashcard` DISABLE KEYS */;
INSERT INTO `flashcard` VALUES (1,'Basic Math Flashcard',1,'STANDARD'),(2,'Geography Flashcard',2,'SPACED_REPETITION'),(3,'Science Fact',3,'STANDARD'),(4,'Literature Quiz',4,'LEITNER'),(5,'Chemistry Flashcard',5,'STANDARD'),(6,'Programming Concept',6,'SPACED_REPETITION'),(7,'History Date',7,'STANDARD'),(8,'Tech Leaders',8,'LEITNER'),(9,'Geography Facts',9,'STANDARD'),(10,'Nature Flashcard',10,'SPACED_REPETITION');
/*!40000 ALTER TABLE `flashcard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `public_id` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `resource_type` enum('IMAGE','VIDEO','AUDIO') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (1,'avatar_1','https://example.com/images/avatar1.jpg','IMAGE'),(2,'avatar_2','https://example.com/images/avatar2.jpg','IMAGE'),(3,'quiz_cover_1','https://example.com/images/quiz1.jpg','IMAGE'),(4,'quiz_cover_2','https://example.com/images/quiz2.jpg','IMAGE'),(5,'question_image_1','https://res.cloudinary.com/dj9r2qksh/image/upload/v1743577885/Quizz_Online/images/cykza9mghdg7pinrujbr.jpg','IMAGE'),(6,'audio_1','https://example.com/audio/listening1.mp3','AUDIO'),(7,'video_1','https://example.com/videos/lesson1.mp4','VIDEO'),(8,'avatar_3','https://example.com/images/avatar3.jpg','IMAGE'),(9,'question_image_2','https://example.com/images/question2.jpg','IMAGE'),(10,'quiz_cover_3','https://example.com/images/quiz3.jpg','IMAGE'),(11,'Quizz_Online/images/cykza9mghdg7pinrujbr','https://res.cloudinary.com/dj9r2qksh/image/upload/v1743577885/Quizz_Online/images/cykza9mghdg7pinrujbr.jpg','IMAGE'),(15,NULL,'https://lh3.googleusercontent.com/a/ACg8ocIIFoJ9plM43W0IF54wYTOLf6jacLNoHvl6e-idXNs_3gYDBkc=s96-c','IMAGE'),(16,NULL,'https://lh3.googleusercontent.com/a/ACg8ocI70oHhSzmR-fK-dBuepMwbXACiSOdwzeU9o46gI7HASuC9lA=s96-c','IMAGE'),(17,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLVMyNxVFNo1CKN-uB64kJ4RDNrvEe23IA6b1Hn7QJ06IAMh8Q=s96-c','IMAGE'),(18,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLVMyNxVFNo1CKN-uB64kJ4RDNrvEe23IA6b1Hn7QJ06IAMh8Q=s96-c','IMAGE'),(19,NULL,'https://lh3.googleusercontent.com/a/ACg8ocJOBBZtim262EeATHnXL0hIlAv4rh60_cHd1QK7dfNCEaKNNwg=s96-c','IMAGE');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notif_id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('SYSTEM','INVITE') DEFAULT NULL,
  `content` text,
  `user` bigint DEFAULT NULL,
  `receiver` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('NOT_SEEN','VIEWED') DEFAULT 'NOT_SEEN',
  PRIMARY KEY (`notif_id`),
  KEY `user` (`user`),
  KEY `receiver` (`receiver`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,'INVITE','John has invited you to join General Knowledge Room',1,2,'Room Invitation','2023-07-01 19:00:00','VIEWED'),(2,'INVITE','John has invited you to join General Knowledge Room',1,3,'Room Invitation','2023-07-01 19:01:00','VIEWED'),(3,'INVITE','John has invited you to join General Knowledge Room',1,4,'Room Invitation','2023-07-01 19:02:00','VIEWED'),(4,'SYSTEM','Your quiz has been completed by 3 users',NULL,1,'Quiz Activity','2023-07-02 10:30:00','NOT_SEEN'),(5,'INVITE','Jane has invited you to join Science Geeks Room',2,3,'Room Invitation','2023-07-03 20:30:00','VIEWED'),(6,'INVITE','Jane has invited you to join Science Geeks Room',2,5,'Room Invitation','2023-07-03 20:31:00','NOT_SEEN'),(7,'SYSTEM','Your account has been verified',NULL,6,'Account Update','2023-07-04 15:45:00','VIEWED'),(8,'SYSTEM','New quiz available in your favorite category',NULL,7,'New Content','2023-07-05 14:20:00','NOT_SEEN'),(9,'INVITE','Robert has invited you to join Tech Talk Room',9,10,'Room Invitation','2023-07-06 21:30:00','NOT_SEEN'),(10,'SYSTEM','Your report has been processed',NULL,3,'Report Update','2023-07-07 11:15:00','VIEWED');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `option`
--

DROP TABLE IF EXISTS `option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `option` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `isCorrect` tinyint(1) DEFAULT NULL,
  `question_id` bigint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `option`
--

LOCK TABLES `option` WRITE;
/*!40000 ALTER TABLE `option` DISABLE KEYS */;
INSERT INTO `option` VALUES (1,'42',1,1),(2,'24',0,1),(3,'44',0,1),(4,'40',0,2),(5,'Paris',1,2),(6,'London',0,3),(7,'Berlin',0,3),(8,'Rome',0,3),(9,'True',1,4),(10,'False',0,4),(11,'William Shakespeare',1,4),(12,'Charles Dickens',0,5),(13,'Jane Austen',0,0),(14,'Mark Twain',0,0),(15,'H2O',1,0),(16,'CO2',0,0),(17,'H2SO4',0,0),(18,'NaCl',0,0),(19,'Python',1,0),(20,'Java',0,0),(21,'C++',0,0),(22,'JavaScript',0,0),(23,'1945',1,0),(24,'1944',0,0),(25,'1946',0,0),(26,'1943',0,0),(27,'Elon Musk',1,0),(28,'Jeff Bezos',0,0),(29,'Bill Gates',0,0),(30,'Mark Zuckerberg',0,0),(31,'Tokyo',1,9),(32,'Beijing',0,9),(33,'Seoul',0,9),(34,'Bangkok',0,9),(35,'All of the above',1,0),(36,'Only A and B',0,0),(37,'Only B and C',0,0),(38,'None of the above',0,0),(39,'Mount Everest',1,10),(40,'K2',0,10);
/*!40000 ALTER TABLE `option` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `type` enum('SINGLE_ANSWER','MULTIPLE_ANSWER','TRUE_FALSE','FILL_IN_THE_BLANK') DEFAULT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  `points` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (1,'What is the answer to the ultimate question of life, the universe, and everything?','2023-02-01 10:00:00','SINGLE_ANSWER',NULL,5),(2,'What is the capital of France?','2023-02-02 11:30:00','SINGLE_ANSWER','5',3),(3,'The Earth is the third planet from the Sun.','2023-02-03 09:15:00','TRUE_FALSE',NULL,2),(4,'Who wrote \"Romeo and Juliet\"?','2023-02-04 14:20:00','SINGLE_ANSWER',NULL,4),(5,'What is the chemical formula for water?','2023-02-05 16:45:00','SINGLE_ANSWER',NULL,3),(6,'Which programming language is known for its use in data science and AI?','2023-02-06 08:30:00','SINGLE_ANSWER','9',5),(7,'When did World War II end?','2023-02-07 12:10:00','SINGLE_ANSWER',NULL,4),(8,'Who is the founder of SpaceX?','2023-02-08 17:25:00','SINGLE_ANSWER',NULL,3),(9,'What is the largest city in Japan?','2023-02-09 13:40:00','SINGLE_ANSWER',NULL,3),(10,'Which is the highest mountain in the world?','2023-02-10 10:55:00','SINGLE_ANSWER',NULL,4),(11,'Who?','2023-02-01 10:00:00','FILL_IN_THE_BLANK',NULL,5);
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `createdBy` bigint DEFAULT NULL,
  `category` bigint DEFAULT NULL,
  `tag` bigint DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `media` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media` (`media`),
  KEY `tag` (`tag`),
  CONSTRAINT `quiz_ibfk_1` FOREIGN KEY (`media`) REFERENCES `media` (`id`),
  CONSTRAINT `quiz_ibfk_2` FOREIGN KEY (`tag`) REFERENCES `tag` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz`
--

LOCK TABLES `quiz` WRITE;
/*!40000 ALTER TABLE `quiz` DISABLE KEYS */;
INSERT INTO `quiz` VALUES (1,'General Knowledge Quiz','Test your general knowledge with these questions!',1,5,1,'2023-03-01 00:30:00',11),(2,'Science Trivia','Fun science questions for all ages',2,1,2,'2023-03-02 01:00:00',11),(3,'History Challenge','How well do you know world history?',3,6,3,'2023-03-03 00:45:00',10),(4,'Geography Explorer','Test your knowledge of world geography',1,1,4,'2023-03-04 00:40:00',NULL),(5,'Literature Masters','Questions about famous literary works',4,6,5,'2023-03-05 01:30:00',NULL),(6,'Programming Basics','Test your programming knowledge',3,8,6,'2023-03-06 00:20:00',NULL),(7,'Pop Culture Quiz','How well do you know modern pop culture?',5,2,NULL,'2023-03-07 00:30:00',NULL),(8,'Math Challenge','Test your mathematical skills',6,1,1,'2023-03-08 00:25:00',NULL),(9,'Language Puzzles','Fun with words and languages',7,7,7,'2023-03-09 00:35:00',NULL),(10,'Tech Giants','Questions about big tech companies and their founders',8,3,6,'2023-03-10 00:30:00',NULL);
/*!40000 ALTER TABLE `quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_question`
--

DROP TABLE IF EXISTS `quiz_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_question` (
  `quiz_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  PRIMARY KEY (`quiz_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `quiz_question_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`),
  CONSTRAINT `quiz_question_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_question`
--

LOCK TABLES `quiz_question` WRITE;
/*!40000 ALTER TABLE `quiz_question` DISABLE KEYS */;
INSERT INTO `quiz_question` VALUES (1,1),(8,1),(1,2),(4,2),(1,3),(2,3),(5,4),(9,4),(2,5),(8,5),(6,6),(10,6),(3,7),(2,8),(3,8),(7,8),(10,8),(1,9),(4,9),(4,10),(2,11);
/*!40000 ALTER TABLE `quiz_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_tag`
--

DROP TABLE IF EXISTS `quiz_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_tag` (
  `quiz_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`quiz_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `quiz_tag_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`),
  CONSTRAINT `quiz_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_tag`
--

LOCK TABLES `quiz_tag` WRITE;
/*!40000 ALTER TABLE `quiz_tag` DISABLE KEYS */;
INSERT INTO `quiz_tag` VALUES (8,1),(1,2),(2,2),(3,3),(4,4),(1,5),(5,5),(6,6),(10,6),(9,7),(7,8),(7,9);
/*!40000 ALTER TABLE `quiz_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rank`
--

DROP TABLE IF EXISTS `rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rank` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `setting` enum('SCORE','ATTEND','TIME','MEAN') DEFAULT 'SCORE',
  `quiz` bigint DEFAULT NULL,
  `result` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz` (`quiz`),
  KEY `result` (`result`),
  CONSTRAINT `rank_ibfk_1` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`),
  CONSTRAINT `rank_ibfk_2` FOREIGN KEY (`result`) REFERENCES `result` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rank`
--

LOCK TABLES `rank` WRITE;
/*!40000 ALTER TABLE `rank` DISABLE KEYS */;
INSERT INTO `rank` VALUES (1,'Gold Medal','SCORE',1,2),(2,'Silver Medal','SCORE',1,1),(3,'Bronze Medal','SCORE',1,3),(4,'First Place','SCORE',2,4),(5,'Champion','SCORE',3,5),(6,'Top Performer','TIME',4,6),(7,'Literature Expert','SCORE',5,7),(8,'Coding Master','SCORE',6,8),(9,'Pop Culture Guru','ATTEND',7,9),(10,'Math Genius','SCORE',8,10);
/*!40000 ALTER TABLE `rank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate`
--

DROP TABLE IF EXISTS `rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user` bigint DEFAULT NULL,
  `quiz` bigint DEFAULT NULL,
  `score` double DEFAULT NULL,
  `feedback` text,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `quiz` (`quiz`),
  CONSTRAINT `rate_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `rate_ibfk_2` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate`
--

LOCK TABLES `rate` WRITE;
/*!40000 ALTER TABLE `rate` DISABLE KEYS */;
INSERT INTO `rate` VALUES (1,2,1,4.5,'Great quiz, learned a lot!'),(2,3,1,5,'Excellent questions, very challenging.'),(3,4,1,4,'Good variety of questions.'),(4,5,2,4.5,'Very informative science quiz.'),(5,6,3,5,'Loved the history questions!'),(6,7,4,3.5,'Some questions were a bit too difficult.'),(7,8,5,4,'Nice literature selections.'),(8,9,6,4.5,'Good programming challenges.'),(9,10,7,3,'Some questions were outdated.'),(10,1,8,5,'Perfect math quiz, very well structured.');
/*!40000 ALTER TABLE `rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user` bigint DEFAULT NULL,
  `quiz` bigint DEFAULT NULL,
  `message` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `quiz` (`quiz`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` VALUES (1,3,2,'Question 3 has a typo.','2023-06-01 10:15:00'),(2,4,3,'The answer for question 2 seems incorrect.','2023-06-02 11:30:00'),(3,5,1,'There are two identical questions.','2023-06-03 09:45:00'),(4,6,4,'The image for question 3 does not load.','2023-06-04 14:00:00'),(5,7,5,'One of the options is missing.','2023-06-05 16:30:00'),(6,8,6,'The scoring seems inaccurate.','2023-06-06 08:45:00'),(7,9,7,'Question 4 has multiple correct answers.','2023-06-07 12:15:00'),(8,10,8,'The difficulty level is inconsistent.','2023-06-08 17:30:00'),(9,1,9,'There is inappropriate content in question 5.','2023-06-09 13:45:00'),(10,2,10,'The timer does not work correctly.','2023-06-10 11:00:00');
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `result` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user` bigint DEFAULT NULL,
  `quiz` bigint DEFAULT NULL,
  `score` double DEFAULT '0',
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('IN_PROGRESS','COMPLETED','TIMEOUT','CANCELLED') DEFAULT 'IN_PROGRESS',
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `quiz` (`quiz`),
  CONSTRAINT `result_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `result_ibfk_2` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
INSERT INTO `result` VALUES (1,2,1,85.5,'2023-05-01 19:15:00','2023-05-01 19:45:00','COMPLETED'),(2,3,1,92,'2023-05-02 20:00:00','2023-05-02 20:30:00','COMPLETED'),(3,4,1,78.5,'2023-05-03 18:30:00','2023-05-03 19:00:00','COMPLETED'),(4,5,2,88,'2023-05-04 21:15:00','2023-05-04 21:45:00','COMPLETED'),(5,6,3,95.5,'2023-05-05 17:30:00','2023-05-05 18:00:00','COMPLETED'),(6,7,4,75,'2023-05-06 19:45:00','2023-05-06 20:15:00','COMPLETED'),(7,8,5,82.5,'2023-05-07 20:30:00','2023-05-07 21:00:00','COMPLETED'),(8,9,6,90,'2023-05-08 18:45:00','2023-05-08 19:15:00','COMPLETED'),(9,10,7,68.5,'2023-05-09 19:30:00','2023-05-09 20:00:00','COMPLETED'),(10,1,8,96,'2023-05-10 21:45:00','2023-05-10 22:15:00','COMPLETED'),(31,15,2,0,'2025-04-14 20:41:51','2025-04-14 22:17:33','COMPLETED'),(32,15,4,0,'2025-04-14 20:42:34','2025-04-14 21:42:34','IN_PROGRESS'),(33,15,8,0,'2025-04-14 20:44:26','2025-04-14 21:44:26','IN_PROGRESS'),(34,15,7,0,'2025-04-14 21:05:38','2025-04-14 22:05:38','IN_PROGRESS'),(35,15,2,0,'2025-04-14 22:17:54','2025-04-14 23:17:54','IN_PROGRESS'),(36,18,2,0,'2025-04-18 13:38:28','2025-04-18 14:38:28','IN_PROGRESS'),(37,20,4,0,'2025-04-18 22:04:38','2025-04-23 15:09:26','COMPLETED'),(38,20,2,0,'2025-04-18 22:05:38','2025-04-18 22:15:13','COMPLETED'),(39,20,6,0,'2025-04-18 22:08:29','2025-04-18 23:08:29','IN_PROGRESS'),(40,20,5,0,'2025-04-18 22:08:34','2025-04-18 23:08:34','IN_PROGRESS'),(41,20,2,0,'2025-04-18 22:15:30','2025-04-23 15:08:49','COMPLETED'),(42,28,2,0,'2025-04-19 19:53:09','2025-04-19 21:07:46','COMPLETED'),(43,28,8,0,'2025-04-19 21:07:32','2025-04-23 20:25:27','COMPLETED'),(44,28,2,0,'2025-04-19 21:07:53','2025-04-23 20:19:22','COMPLETED'),(45,14,7,0,'2025-04-23 13:57:28','2025-04-23 14:57:28','IN_PROGRESS'),(46,14,10,0,'2025-04-23 13:57:40','2025-04-23 14:57:40','IN_PROGRESS'),(47,14,4,0,'2025-04-23 13:58:28','2025-04-23 14:58:28','IN_PROGRESS'),(48,20,4,0,'2025-04-23 15:10:29','2025-04-23 16:10:29','IN_PROGRESS'),(49,20,2,0,'2025-04-23 15:10:40','2025-04-23 16:10:40','IN_PROGRESS'),(50,20,8,0,'2025-04-23 15:10:52','2025-04-23 16:10:52','IN_PROGRESS'),(51,20,7,0,'2025-04-23 15:10:57','2025-04-23 16:10:57','IN_PROGRESS');
/*!40000 ALTER TABLE `result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `max_players` int DEFAULT NULL,
  `creator` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `quiz` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator` (`creator`),
  KEY `quiz` (`quiz`),
  CONSTRAINT `room_ibfk_1` FOREIGN KEY (`creator`) REFERENCES `user` (`id`),
  CONSTRAINT `room_ibfk_2` FOREIGN KEY (`quiz`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,'General Knowledge Room','123456',10,1,'2023-04-01 19:00:00',1),(2,'Science Geeks','',8,2,'2023-04-02 20:30:00',2),(3,'History Buffs','history123',6,3,'2023-04-03 18:15:00',3),(4,'Geography Challenge','geo2023',10,1,'2023-04-04 21:00:00',4),(5,'Book Lovers','',8,4,'2023-04-05 17:45:00',5),(6,'Coders Den','code123',12,3,'2023-04-06 19:30:00',6),(7,'Pop Quiz Night','popquiz',15,5,'2023-04-07 20:00:00',7),(8,'Math Wizards','12345',6,6,'2023-04-08 18:30:00',8),(9,'Language Masters','',10,7,'2023-04-09 19:15:00',9),(10,'Tech Talk','tech2023',8,8,'2023-04-10 21:30:00',10);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_user`
--

DROP TABLE IF EXISTS `room_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_user` (
  `room_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `room_user_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`),
  CONSTRAINT `room_user_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_user`
--

LOCK TABLES `room_user` WRITE;
/*!40000 ALTER TABLE `room_user` DISABLE KEYS */;
INSERT INTO `room_user` VALUES (1,1),(4,1),(10,1),(1,2),(2,2),(1,3),(2,3),(3,3),(6,3),(10,3),(1,4),(4,4),(5,4),(2,5),(6,5),(7,5),(3,6),(6,6),(8,6),(3,7),(6,7),(9,7),(4,8),(7,8),(9,8),(10,8),(4,9),(7,9),(9,9),(5,10),(8,10);
/*!40000 ALTER TABLE `room_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('G5je9l49pqUsKRmTvC2o7Ust2sowDYdV',1745502198,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-04-24T13:18:32.370Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":\"110603245103218857300\"},\"userId\":21,\"role\":\"USER\",\"auth\":true,\"authUser\":{\"id\":21,\"email\":\"ngcuong1182004@gmail.com\",\"username\":\"narrqqq\",\"role\":\"USER\",\"provider\":\"GOOGLE\",\"created_at\":\"2025-04-22T14:39:32.000Z\",\"user\":28},\"is_premium\":false}'),('jBXvfG98O6sLVoRGWfn5wmpiOe25PQ5y',1745483182,'{\"cookie\":{\"originalMaxAge\":86399999,\"expires\":\"2025-04-24T08:07:54.780Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"auth\":true,\"flash\":{},\"userId\":14,\"role\":\"USER\",\"authUser\":{\"id\":14,\"email\":\"1\",\"password\":\"$2b$10$UaymIU59kQ6D02j789UwP.aXZe14xW9G3owHSa9XOOY9qc3mFx.bC\",\"oauth_id\":\"\",\"created_at\":\"2025-04-18T14:18:18.000Z\",\"provider\":\"USER\",\"user\":20,\"isVerified\":1,\"role\":\"USER\",\"verification_token\":\"\",\"token_expiry\":\"2025-04-19T07:03:51.000Z\",\"username\":\"User tesst\"},\"is_premium\":false}'),('jbgGIsluxoeJFDdDZ3FVV7I726o4QvEc',1745479769,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-04-24T06:57:04.303Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":\"115298193863858042232\"},\"userId\":11,\"role\":\"USER\",\"auth\":true,\"authUser\":{\"id\":11,\"email\":\"nmcuongg2004@gmail.com\",\"username\":\"add\",\"role\":\"USER\",\"provider\":\"GOOGLE\",\"created_at\":\"2025-04-12T16:25:38.000Z\",\"user\":14},\"is_premium\":false}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'Mathematics'),(2,'Science'),(3,'History'),(4,'Geography'),(5,'Literature'),(6,'Computer Science'),(7,'Languages'),(8,'Art'),(9,'Music'),(10,'Sports');
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `gender` enum('MALE','FEMALE') DEFAULT NULL,
  `avata` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `avata` (`avata`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`avata`) REFERENCES `media` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'johndoe','john.doe@example.com','0901234567','MALE',1),(2,'janesmith','jane.smith@example.com','0912345678','FEMALE',2),(3,'alexnguyen','alex.nguyen@example.com','0923456789','MALE',8),(4,'sarahlee','sarah.lee@example.com','0934567890','FEMALE',NULL),(5,'miketran','mike.tran@example.com','0945678901','MALE',NULL),(6,'emilypham','emily.pham@example.com','0956789012','FEMALE',NULL),(7,'davidhoang','david.hoang@example.com','0967890123','MALE',NULL),(8,'sophievo','sophie.vo@example.com','0978901234','FEMALE',NULL),(9,'robertle','robert.le@example.com','0989012345','MALE',NULL),(10,'lisawong','lisa.wong@example.com','0990123456','FEMALE',NULL),(14,'add',NULL,NULL,NULL,15),(15,'Ng Cuong',NULL,NULL,NULL,16),(16,'Nguyen Manh Cuong',NULL,NULL,NULL,17),(18,'Nguyen Manh Cuong',NULL,NULL,NULL,18),(20,'User tesst',NULL,NULL,NULL,NULL),(28,'narrqqq',NULL,NULL,NULL,19);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `useranswer`
--

DROP TABLE IF EXISTS `useranswer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `useranswer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint DEFAULT NULL,
  `option_id` bigint DEFAULT NULL,
  `result_id` bigint DEFAULT NULL,
  `text_answer` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  KEY `option_id` (`option_id`),
  KEY `result_id` (`result_id`),
  CONSTRAINT `useranswer_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  CONSTRAINT `useranswer_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `option` (`id`),
  CONSTRAINT `useranswer_ibfk_3` FOREIGN KEY (`result_id`) REFERENCES `result` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `useranswer`
--

LOCK TABLES `useranswer` WRITE;
/*!40000 ALTER TABLE `useranswer` DISABLE KEYS */;
INSERT INTO `useranswer` VALUES (1,1,1,1,''),(2,2,4,1,''),(3,1,2,2,''),(4,2,4,2,''),(5,3,5,3,''),(8,1,3,33,''),(9,5,12,33,''),(10,3,6,31,''),(11,9,34,32,''),(12,2,4,32,''),(13,11,NULL,31,'adasasa'),(14,5,12,31,''),(15,5,12,36,''),(16,3,6,38,''),(17,5,12,38,''),(18,11,NULL,38,'aaa'),(19,4,10,40,''),(20,9,33,37,''),(21,10,39,37,''),(22,3,7,42,''),(23,5,12,42,''),(24,11,NULL,42,'âsa'),(25,3,7,44,''),(26,5,12,44,''),(27,9,34,47,'');
/*!40000 ALTER TABLE `useranswer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-26 20:44:29
