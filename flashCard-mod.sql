ALTER TABLE `quizz`.`question`
ADD COLUMN `explanation` TEXT DEFAULT NULL AFTER `points`;

-- Create `set` table if it doesn't exist (for completeness, replacing previous flashcard_set)
CREATE TABLE IF NOT EXISTS `set` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `created_by` bigint DEFAULT NULL,
  `category` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `media` bigint DEFAULT NULL,
  `tag` bigint DEFAULT NULL,
  `note` text,
  `level` enum('EASY','MEDIUM','HARD') DEFAULT 'EASY',
  `progress` int DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `category` (`category`),
  KEY `media` (`media`),
  KEY `tag` (`tag`),
  CONSTRAINT `set_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `set_ibfk_2` FOREIGN KEY (`category`) REFERENCES `category` (`id`),
  CONSTRAINT `set_ibfk_3` FOREIGN KEY (`media`) REFERENCES `media` (`id`),
  CONSTRAINT `set_ibfk_4` FOREIGN KEY (`tag`) REFERENCES `tag` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create `set_flashcard` table if it doesn't exist (for completeness, replacing previous flashcard_set_flashcard)
CREATE TABLE IF NOT EXISTS `set_flashcard` (
  `set_id` bigint NOT NULL,
  `flashcard_id` bigint NOT NULL,
  PRIMARY KEY (`set_id`, `flashcard_id`),
  KEY `flashcard_id` (`flashcard_id`),
  CONSTRAINT `set_flashcard_ibfk_1` FOREIGN KEY (`set_id`) REFERENCES `set` (`id`) ON DELETE CASCADE,
  CONSTRAINT `set_flashcard_ibfk_2` FOREIGN KEY (`flashcard_id`) REFERENCES `flashcard` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Modify `flashcard` table to add new columns
ALTER TABLE `flashcard`
ADD COLUMN `tag` bigint DEFAULT NULL,
ADD COLUMN `progress` enum('1','2','3','4','5') DEFAULT '1',
ADD CONSTRAINT `flashcard_ibfk_2` FOREIGN KEY (`tag`) REFERENCES `tag` (`id`);