/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE `comment` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `content` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `image_id` (`image_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `comment_like` (
  `user_id` int NOT NULL,
  `comment_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`comment_id`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `comment_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `comment_like_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `friend_ship` (
  `friendship_id` int NOT NULL AUTO_INCREMENT,
  `user_id_1` int DEFAULT NULL,
  `user_id_2` int DEFAULT NULL,
  `status` enum('pending','accepted','blocked') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`friendship_id`),
  KEY `user_id_1` (`user_id_1`),
  KEY `user_id_2` (`user_id_2`),
  CONSTRAINT `friend_ship_ibfk_1` FOREIGN KEY (`user_id_1`) REFERENCES `user` (`user_id`),
  CONSTRAINT `friend_ship_ibfk_2` FOREIGN KEY (`user_id_2`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `image` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `image_name` varchar(100) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_list_id` int DEFAULT NULL,
  `is_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `image_list_id` (`image_list_id`),
  CONSTRAINT `image_ibfk_1` FOREIGN KEY (`image_list_id`) REFERENCES `image_list` (`image_list_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `image_like` (
  `user_id` int NOT NULL,
  `image_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`image_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `image_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `image_like_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `image_list` (
  `image_list_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `list_name` varchar(255) DEFAULT NULL,
  `privacy_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_list_id`),
  KEY `user_id` (`user_id`),
  KEY `privacy_id` (`privacy_id`),
  CONSTRAINT `image_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `image_list_ibfk_2` FOREIGN KEY (`privacy_id`) REFERENCES `privacy` (`privacy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `msg_conversation` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `conversation_name` varchar(255) DEFAULT NULL,
  `creator_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `msg_conversation_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `msg_message` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `content` varchar(5000) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `msg_message_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `msg_message_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `msg_conversation` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `msg_participant` (
  `participant_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `conversation_id` int DEFAULT NULL,
  `joined_datetime` datetime DEFAULT NULL,
  `left_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`participant_id`),
  KEY `user_id` (`user_id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `msg_participant_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `msg_participant_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `msg_conversation` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `news` (
  `news_id` int NOT NULL AUTO_INCREMENT,
  `image_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `music_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`news_id`),
  KEY `user_id` (`user_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `news_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `notification` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` enum('post','message') DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `message_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  KEY `message_id` (`message_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `notification_ibfk_3` FOREIGN KEY (`message_id`) REFERENCES `msg_message` (`message_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `content` varchar(5000) DEFAULT NULL,
  `video_url` varchar(1000) DEFAULT NULL,
  `privacy_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  KEY `privacy_id` (`privacy_id`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`privacy_id`) REFERENCES `privacy` (`privacy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_image` (
  `post_image_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`post_image_id`),
  KEY `post_id` (`post_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `post_image_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`),
  CONSTRAINT `post_image_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_like` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `post_like_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `privacy` (
  `privacy_id` int NOT NULL AUTO_INCREMENT,
  `options` varchar(255) NOT NULL,
  PRIMARY KEY (`privacy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ro_permission` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) DEFAULT NULL,
  `permission_desc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ro_role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `role_name` enum('admin','user','celebrity','guests') DEFAULT NULL,
  `role_desc` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ro_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ro_role_permission` (
  `role_permission_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `permission_id` int DEFAULT NULL,
  PRIMARY KEY (`role_permission_id`),
  KEY `role_id` (`role_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `ro_role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `ro_role` (`role_id`),
  CONSTRAINT `ro_role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `ro_permission` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `save_image` (
  `user_id` int NOT NULL,
  `image_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`image_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `save_image_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `save_image_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `session` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `token` varchar(2000) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT NULL,
  `login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `pass_word` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_follow` (
  `follower_id` int NOT NULL,
  `following_id` int NOT NULL,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `user_follow_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `user_follow_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_info` (
  `user_id` int NOT NULL,
  `age` int DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `study_at` varchar(150) DEFAULT NULL,
  `working_at` varchar(150) DEFAULT NULL,
  `favorites` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `comment` (`comment_id`, `user_id`, `image_id`, `post_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 7, NULL, 1, 'biệt ấn 1', '2023-07-05 10:10:45', NULL);
INSERT INTO `comment` (`comment_id`, `user_id`, `image_id`, `post_id`, `content`, `created_at`, `updated_at`) VALUES
(2, 7, NULL, 1, 'biệt ấn 1', '2023-07-05 10:18:25', NULL);
INSERT INTO `comment` (`comment_id`, `user_id`, `image_id`, `post_id`, `content`, `created_at`, `updated_at`) VALUES
(3, 7, NULL, 1, 'cảnh đẹp 1', '2023-07-05 13:37:01', NULL);
INSERT INTO `comment` (`comment_id`, `user_id`, `image_id`, `post_id`, `content`, `created_at`, `updated_at`) VALUES
(4, 7, NULL, 3, 'cảnh đẹp 1', '2023-07-05 13:37:41', NULL),
(5, 6, NULL, 3, 'đời là thế thôi', '2023-07-05 13:38:34', NULL),
(6, 6, NULL, 3, 'nghiệp quật', '2023-07-05 13:39:31', NULL),
(7, 6, NULL, 6, 'thật bất ngờ', '2023-07-05 13:41:24', NULL),
(9, 6, 5, NULL, 'ảnh này chất đấy', '2023-07-06 08:01:12', NULL),
(10, 6, 5, NULL, 'qqqqq', '2023-07-06 08:01:33', '2023-07-06 08:02:30'),
(12, 6, 6, NULL, 'bình luận 5', '2023-07-06 08:19:34', NULL),
(15, 6, 6, NULL, 'bình luận 7', '2023-07-06 08:32:15', NULL),
(16, 6, 6, NULL, 'bình luận 8', '2023-07-06 08:32:20', NULL),
(18, 11, NULL, 12, 'ca khúc hay quá anh Vâu ơi', '2023-07-10 16:01:29', NULL),
(19, 11, NULL, 12, 'tuyệt vời ', '2023-07-10 16:02:52', NULL),
(21, 11, 26, NULL, 'rùa con này dễ thương thế', '2023-07-10 16:08:09', NULL),
(22, 17, NULL, 12, 'hung17 thấy cũng hay ', '2023-07-11 03:34:18', NULL),
(23, 17, NULL, 12, 'hung17 trời khá tệ để đi chơi ', '2023-07-11 03:34:46', NULL),
(24, 17, NULL, 12, 'hung17 cũng tạm tạm', '2023-07-11 03:34:55', NULL),
(25, 17, 32, NULL, 'rùa hệ nước', '2023-07-11 03:36:49', NULL),
(26, 17, 32, NULL, 'rùa khá là mạnh đó', '2023-07-11 03:37:05', NULL);

INSERT INTO `comment_like` (`user_id`, `comment_id`) VALUES
(6, 1);


INSERT INTO `friend_ship` (`friendship_id`, `user_id_1`, `user_id_2`, `status`, `created_at`, `updated_at`) VALUES
(1, 7, 1, 'accepted', '2023-07-05 09:54:52', '2023-07-05 10:00:09');
INSERT INTO `friend_ship` (`friendship_id`, `user_id_1`, `user_id_2`, `status`, `created_at`, `updated_at`) VALUES
(2, 7, 2, 'pending', '2023-07-05 09:55:24', NULL);
INSERT INTO `friend_ship` (`friendship_id`, `user_id_1`, `user_id_2`, `status`, `created_at`, `updated_at`) VALUES
(3, 7, 3, 'pending', '2023-07-05 09:55:30', NULL);
INSERT INTO `friend_ship` (`friendship_id`, `user_id_1`, `user_id_2`, `status`, `created_at`, `updated_at`) VALUES
(4, 7, 4, 'pending', '2023-07-05 09:55:35', NULL),
(5, 5, 1, 'accepted', '2023-07-05 09:56:11', '2023-07-05 09:59:52'),
(6, 5, 2, 'pending', '2023-07-05 09:56:15', NULL),
(7, 5, 7, 'accepted', '2023-07-05 09:56:20', '2023-07-05 09:59:08'),
(8, 6, 7, 'pending', '2023-07-05 09:56:39', NULL),
(10, 11, 7, 'pending', '2023-07-10 15:54:05', NULL),
(11, 11, 8, 'pending', '2023-07-10 15:54:10', NULL),
(12, 17, 8, 'pending', '2023-07-11 03:27:02', NULL),
(13, 17, 9, 'pending', '2023-07-11 03:27:10', NULL),
(14, 17, 10, 'pending', '2023-07-11 03:27:14', NULL),
(15, 17, 11, 'accepted', '2023-07-11 03:31:04', '2023-07-11 03:32:34');

INSERT INTO `image` (`image_id`, `image_name`, `path`, `description`, `image_list_id`, `is_delete`, `created_at`, `updated_at`) VALUES
(1, 'squirtle.png', '1688548176855_squirtle.png', 'rùa nước dễ thương', 9, 0, '2023-07-05 09:09:37', NULL);
INSERT INTO `image` (`image_id`, `image_name`, `path`, `description`, `image_list_id`, `is_delete`, `created_at`, `updated_at`) VALUES
(2, 'ironman-1.jpg', '1688548235593_ironman-1.jpg', 'người sắt mạnh nhất', 9, 0, '2023-07-05 09:10:36', NULL);
INSERT INTO `image` (`image_id`, `image_name`, `path`, `description`, `image_list_id`, `is_delete`, `created_at`, `updated_at`) VALUES
(3, 'sơ ri.jpg', '1688548248551_sơ ri.jpg', 'sơ ri ngon', 9, 1, '2023-07-05 09:10:49', '2023-07-10 15:43:54');
INSERT INTO `image` (`image_id`, `image_name`, `path`, `description`, `image_list_id`, `is_delete`, `created_at`, `updated_at`) VALUES
(4, 'ironman-1.jpg', '1688548302103_ironman-1.jpg', 'người sắt 3', 5, 0, '2023-07-05 09:11:42', NULL),
(5, 'squirtle.png', '1688548311725_squirtle.png', 'rùa 3', 5, 0, '2023-07-05 09:11:52', NULL),
(6, 'ironman-1.jpg', '1688548342966_ironman-1.jpg', 'người sắt 4', 7, 0, '2023-07-05 09:12:23', NULL),
(7, 'squirtle.png', '1688548351495_squirtle.png', 'rùa 4', 7, 1, '2023-07-05 09:12:32', '2023-07-11 03:21:06'),
(8, 'squirtle.png', '1688548679648_squirtle.png', 'rùa 7', 13, 0, '2023-07-05 09:18:00', NULL),
(9, 'ironman-1.jpg', '1688549445983_ironman-1.jpg', NULL, 13, 0, '2023-07-05 09:30:46', NULL),
(10, 'sơ ri.jpg', '1688549445984_sơ ri.jpg', NULL, 13, 0, '2023-07-05 09:30:46', NULL),
(11, 'squirtle.png', '1688549445984_squirtle.png', NULL, 13, 0, '2023-07-05 09:30:46', NULL),
(12, 'squirtle.png', '1688549655193_squirtle.png', NULL, 7, 0, '2023-07-05 09:34:15', NULL),
(13, 'sơ ri.jpg', '1688551932561_sơ ri.jpg', NULL, 13, 0, '2023-07-05 10:12:13', NULL),
(14, 'squirtle.png', '1688551954642_squirtle.png', NULL, 13, 0, '2023-07-05 10:12:35', NULL),
(15, 'ironman-1.jpg', '1688551994015_ironman-1.jpg', NULL, 9, 0, '2023-07-05 10:13:14', NULL),
(16, 'ironman-1.jpg', '1688552007773_ironman-1.jpg', NULL, 9, 0, '2023-07-05 10:13:28', NULL),
(17, 'ironman-1.jpg', '1688552030849_ironman-1.jpg', NULL, 9, 0, '2023-07-05 10:13:51', NULL),
(18, 'ironman-1.jpg', '1688552035485_ironman-1.jpg', NULL, 9, 0, '2023-07-05 10:13:56', NULL),
(19, 'ironman-1.jpg', '1688552062143_ironman-1.jpg', NULL, 11, 0, '2023-07-05 10:14:22', NULL),
(20, 'ironman-1.jpg', '1688552065204_ironman-1.jpg', NULL, 11, 0, '2023-07-05 10:14:25', NULL),
(21, 'squirtle.png', '1689001250335_squirtle.png', NULL, 24, 0, '2023-07-10 15:00:50', NULL),
(22, 'ironman-1.jpg', '1689001466801_ironman-1.jpg', NULL, 24, 0, '2023-07-10 15:04:27', NULL),
(23, 'sơ ri mới', '1689003020175_sơ ri.jpg', 'ngonnnnn', 24, 0, '2023-07-10 15:30:20', '2023-07-10 15:38:22'),
(24, 'ironman-1.jpg', '1689004110137_ironman-1.jpg', NULL, 24, 0, '2023-07-10 15:48:30', NULL),
(25, 'sơ ri.jpg', '1689004110139_sơ ri.jpg', NULL, 24, 0, '2023-07-10 15:48:30', NULL),
(26, 'squirtle.png', '1689004110140_squirtle.png', NULL, 24, 0, '2023-07-10 15:48:30', NULL),
(27, 'ironman-1.jpg', '1689043838924_ironman-1.jpg', NULL, 33, 0, '2023-07-11 02:50:39', NULL),
(28, 'squirtle.png', '1689044892446_squirtle.png', NULL, 37, 0, '2023-07-11 03:08:13', NULL),
(29, 'ironman-1.jpg', '1689045430864_ironman-1.jpg', 'iron man vô đối', 37, 0, '2023-07-11 03:17:11', NULL),
(30, 'ironman-1.jpg', '1689045767873_ironman-1.jpg', NULL, 37, 0, '2023-07-11 03:22:48', NULL),
(31, 'sơ ri.jpg', '1689045767877_sơ ri.jpg', NULL, 37, 0, '2023-07-11 03:22:48', NULL),
(32, 'squirtle.png', '1689045767877_squirtle.png', NULL, 37, 0, '2023-07-11 03:22:48', NULL),
(33, 'squirtle.png', '1689838061128_squirtle.png', NULL, 37, 0, '2023-07-20 07:27:41', NULL),
(34, 'sơ ri.jpg', '1689838252215_sơ ri.jpg', NULL, 37, 0, '2023-07-20 07:30:52', NULL),
(35, 'sơ ri.jpg', '1689839080278_sơ ri.jpg', NULL, 37, 0, '2023-07-20 07:44:40', NULL),
(36, 'haaland.jpg', '1689839172090_haaland.jpg', NULL, 37, 0, '2023-07-20 07:46:12', NULL),
(37, 'ironman-1.jpg', '1689839239005_ironman-1.jpg', NULL, 39, 0, '2023-07-20 07:47:19', NULL),
(38, 'ironman-1.jpg', '1689839865627_ironman-1.jpg', NULL, 24, 0, '2023-07-20 07:57:46', NULL),
(39, 'haaland.jpg', '1689839965721_haaland.jpg', NULL, 13, 0, '2023-07-20 07:59:26', NULL),
(40, 'squirtle.png', '1689840066406_squirtle.png', NULL, 7, 0, '2023-07-20 08:01:06', NULL);

INSERT INTO `image_like` (`user_id`, `image_id`) VALUES
(4, 1);
INSERT INTO `image_like` (`user_id`, `image_id`) VALUES
(5, 1);
INSERT INTO `image_like` (`user_id`, `image_id`) VALUES
(6, 1);
INSERT INTO `image_like` (`user_id`, `image_id`) VALUES
(5, 2),
(6, 2),
(5, 3),
(6, 3),
(4, 4),
(5, 4),
(6, 4),
(4, 5),
(4, 6),
(4, 7);

INSERT INTO `image_list` (`image_list_id`, `user_id`, `list_name`, `privacy_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'uploaded-images', 1, '2023-07-05 03:58:40', '2023-07-05 14:54:10');
INSERT INTO `image_list` (`image_list_id`, `user_id`, `list_name`, `privacy_id`, `created_at`, `updated_at`) VALUES
(2, 1, 'saved-images', 1, '2023-07-05 03:58:40', NULL);
INSERT INTO `image_list` (`image_list_id`, `user_id`, `list_name`, `privacy_id`, `created_at`, `updated_at`) VALUES
(3, 2, 'uploaded-images', 1, '2023-07-05 03:59:31', NULL);
INSERT INTO `image_list` (`image_list_id`, `user_id`, `list_name`, `privacy_id`, `created_at`, `updated_at`) VALUES
(4, 2, 'saved-images', 1, '2023-07-05 03:59:31', NULL),
(5, 3, 'uploaded-images', 1, '2023-07-05 03:59:36', NULL),
(6, 3, 'saved-images', 1, '2023-07-05 03:59:36', NULL),
(7, 4, 'uploaded-images', 1, '2023-07-05 03:59:39', NULL),
(8, 4, 'saved-images', 1, '2023-07-05 03:59:39', NULL),
(9, 5, 'uploaded-images', 1, '2023-07-05 03:59:42', NULL),
(10, 5, 'saved-images', 1, '2023-07-05 03:59:42', NULL),
(11, 6, 'uploaded-images', 1, '2023-07-05 04:20:58', NULL),
(12, 6, 'saved-images', 1, '2023-07-05 04:20:58', NULL),
(13, 7, 'uploaded-images', 1, '2023-07-05 04:24:15', NULL),
(14, 7, 'saved-images', 1, '2023-07-05 04:24:15', NULL),
(16, 9, 'uploaded-images', 1, '2023-07-05 05:18:18', NULL),
(17, 9, 'saved-images', 1, '2023-07-05 05:18:18', NULL),
(21, 5, 'album 5', 1, '2023-07-05 07:39:21', '2023-07-05 08:11:49'),
(22, 10, 'uploaded-images', 1, '2023-07-10 02:42:28', NULL),
(23, 10, 'saved-images', 1, '2023-07-10 02:42:28', NULL),
(24, 11, 'uploaded-images', 1, '2023-07-10 14:51:05', NULL),
(25, 11, 'saved-images', 1, '2023-07-10 14:51:05', NULL),
(26, 12, 'uploaded-images', 1, '2023-07-10 14:53:07', NULL),
(27, 12, 'saved-images', 1, '2023-07-10 14:53:07', NULL),
(28, 13, 'uploaded-images', 1, '2023-07-10 15:14:13', NULL),
(29, 13, 'saved-images', 1, '2023-07-10 15:14:13', NULL),
(31, 14, 'uploaded-images', 1, '2023-07-11 02:42:38', NULL),
(32, 14, 'saved-images', 1, '2023-07-11 02:42:38', NULL),
(33, 15, 'uploaded-images', 1, '2023-07-11 02:46:26', NULL),
(34, 15, 'saved-images', 1, '2023-07-11 02:46:26', NULL),
(35, 16, 'uploaded-images', 1, '2023-07-11 02:47:19', NULL),
(36, 16, 'saved-images', 1, '2023-07-11 02:47:19', NULL),
(37, 17, 'uploaded-images', 1, '2023-07-11 03:04:02', NULL),
(38, 17, 'saved-images', 1, '2023-07-11 03:04:02', NULL),
(39, 18, 'uploaded-images', 1, '2023-07-11 03:05:02', NULL),
(40, 18, 'saved-images', 1, '2023-07-11 03:05:02', NULL),
(41, 19, 'uploaded-images', 1, '2023-07-11 03:12:03', NULL),
(42, 19, 'saved-images', 1, '2023-07-11 03:12:03', NULL),
(43, 17, 'album của hung 17', 1, '2023-07-11 03:15:09', NULL),
(44, 17, 'album của hung mới nhất', 1, '2023-07-11 03:15:26', NULL),
(45, 17, 'album biển đẹp', 1, '2023-07-11 03:15:39', NULL),
(46, 20, 'uploaded-images', 1, '2023-07-25 07:19:06', NULL),
(47, 20, 'saved-images', 1, '2023-07-25 07:19:06', NULL),
(48, 21, 'uploaded-images', 1, '2023-07-25 07:23:25', NULL),
(49, 21, 'saved-images', 1, '2023-07-25 07:23:25', NULL);







INSERT INTO `news` (`news_id`, `image_id`, `user_id`, `music_url`) VALUES
(1, 35, 17, 'www.test.com');
INSERT INTO `news` (`news_id`, `image_id`, `user_id`, `music_url`) VALUES
(2, 36, 17, 'haaland.mp3');
INSERT INTO `news` (`news_id`, `image_id`, `user_id`, `music_url`) VALUES
(3, 37, 18, 'ironman.mp3');
INSERT INTO `news` (`news_id`, `image_id`, `user_id`, `music_url`) VALUES
(4, 38, 11, NULL),
(5, 39, 7, 'haaland22222.mp3'),
(6, 40, 4, 'ruafffffff.mp3');



INSERT INTO `post` (`post_id`, `user_id`, `content`, `video_url`, `privacy_id`, `created_at`, `updated_at`, `is_deleted`) VALUES
(1, 7, '3 tấm hình đẹp', 'https://www.youtube.com/saitama', 1, '2023-07-05 09:29:05', NULL, 0);
INSERT INTO `post` (`post_id`, `user_id`, `content`, `video_url`, `privacy_id`, `created_at`, `updated_at`, `is_deleted`) VALUES
(2, 7, '3 tấm hình đẹp có ảnh rõ ràng', 'https://www.youtube.com/3pic', 1, '2023-07-05 09:30:46', '2023-07-05 09:42:32', 1);
INSERT INTO `post` (`post_id`, `user_id`, `content`, `video_url`, `privacy_id`, `created_at`, `updated_at`, `is_deleted`) VALUES
(3, 4, 'pokemon i choose you', 'https://www.youtube.com/rua', 1, '2023-07-05 09:34:15', NULL, 0);
INSERT INTO `post` (`post_id`, `user_id`, `content`, `video_url`, `privacy_id`, `created_at`, `updated_at`, `is_deleted`) VALUES
(4, 7, 'content 4', 'https://www.youtube.com/video4', 1, '2023-07-05 10:12:13', NULL, 0),
(5, 7, 'content 5', 'https://www.youtube.com/video5', 1, '2023-07-05 10:12:35', NULL, 0),
(6, 5, 'user 5 post 5', 'https://www.youtube.com/video5', 1, '2023-07-05 10:13:14', NULL, 0),
(7, 5, 'user5  ---- post 6', 'https://www.youtube.com/video5', 1, '2023-07-05 10:13:28', NULL, 0),
(8, 5, 'user5  ---- post 7', 'https://www.youtube.com/video5', 1, '2023-07-05 10:13:51', NULL, 0),
(9, 5, 'user5  ---- post 8', 'https://www.youtube.com/video5', 1, '2023-07-05 10:13:55', NULL, 0),
(10, 6, 'user6  ---- post 1', 'https://www.youtube.com/video5', 1, '2023-07-05 10:14:22', NULL, 0),
(11, 6, 'user6  ---- post 2', 'https://www.youtube.com/video5', 1, '2023-07-05 10:14:25', NULL, 0),
(12, 11, 'bài này chill phết', 'https://www.youtube.com/video5', 1, '2023-07-10 15:47:01', '2023-07-10 15:52:27', 1),
(13, 11, 'post mới của user 11', 'https://www.youtube.com/qqqqqqqqqqq', 1, '2023-07-10 15:48:30', NULL, 0),
(14, 17, 'post mới của user 17', 'https://www.youtube.com/video-hay', 1, '2023-07-11 03:22:48', '2023-07-11 03:26:16', 1),
(15, 17, 'trời này đi đá banh là tuyệt vời', 'https://www.youtube.com/video-hay', 1, '2023-07-11 03:23:57', NULL, 0);

INSERT INTO `post_image` (`post_image_id`, `post_id`, `image_id`) VALUES
(1, 2, 9);
INSERT INTO `post_image` (`post_image_id`, `post_id`, `image_id`) VALUES
(2, 2, 10);
INSERT INTO `post_image` (`post_image_id`, `post_id`, `image_id`) VALUES
(3, 2, 11);
INSERT INTO `post_image` (`post_image_id`, `post_id`, `image_id`) VALUES
(4, 3, 12),
(5, 4, 13),
(6, 5, 14),
(7, 6, 15),
(8, 7, 16),
(9, 8, 17),
(10, 9, 18),
(11, 10, 19),
(12, 11, 20),
(13, 13, 26),
(14, 13, 25),
(15, 13, 24),
(16, 14, 31),
(17, 14, 30),
(18, 14, 32);

INSERT INTO `post_like` (`user_id`, `post_id`) VALUES
(5, 2);
INSERT INTO `post_like` (`user_id`, `post_id`) VALUES
(6, 2);
INSERT INTO `post_like` (`user_id`, `post_id`) VALUES
(7, 2);
INSERT INTO `post_like` (`user_id`, `post_id`) VALUES
(5, 3),
(6, 3),
(7, 3),
(4, 4),
(5, 4),
(6, 4),
(7, 4),
(4, 5),
(7, 5),
(4, 12),
(11, 12),
(17, 12);

INSERT INTO `privacy` (`privacy_id`, `options`) VALUES
(1, 'public');
INSERT INTO `privacy` (`privacy_id`, `options`) VALUES
(2, 'friend');
INSERT INTO `privacy` (`privacy_id`, `options`) VALUES
(3, 'private');



INSERT INTO `ro_role` (`role_id`, `user_id`, `role_name`, `role_desc`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-05 03:58:40', NULL);
INSERT INTO `ro_role` (`role_id`, `user_id`, `role_name`, `role_desc`, `created_at`, `updated_at`) VALUES
(2, 2, 'user', 'Người dùng được thao tác giới hạn', '2023-07-05 03:59:31', NULL);
INSERT INTO `ro_role` (`role_id`, `user_id`, `role_name`, `role_desc`, `created_at`, `updated_at`) VALUES
(3, 3, 'user', 'Người dùng được thao tác giới hạn', '2023-07-05 03:59:36', NULL);
INSERT INTO `ro_role` (`role_id`, `user_id`, `role_name`, `role_desc`, `created_at`, `updated_at`) VALUES
(4, 4, 'user', 'Người dùng được thao tác giới hạn', '2023-07-05 03:59:39', NULL),
(5, 5, 'user', 'Người dùng được thao tác giới hạn', '2023-07-05 03:59:42', NULL),
(6, 6, 'user', 'Người dùng được thao tác giới hạn', '2023-07-05 04:20:58', NULL),
(7, 7, 'celebrity', 'Người nổi tiếng, được user nhấn theo dõi', '2023-07-05 04:24:15', '2023-07-11 03:13:19'),
(8, 8, 'celebrity', 'Người nổi tiếng, được user nhấn theo dõi', '2023-07-05 05:16:44', '2023-07-05 05:27:18'),
(9, 9, 'celebrity', 'Người nổi tiếng, được user nhấn theo dõi', '2023-07-05 05:18:18', '2023-07-10 15:15:45'),
(10, 10, 'user', 'Người dùng được thao tác giới hạn', '2023-07-10 02:42:28', NULL),
(11, 11, 'user', 'Người dùng được thao tác giới hạn', '2023-07-10 14:51:05', NULL),
(12, 12, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-10 14:53:07', NULL),
(13, 13, 'user', 'Người dùng được thao tác giới hạn', '2023-07-10 15:14:13', NULL),
(14, 14, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-11 02:42:38', NULL),
(15, 15, 'user', 'Người dùng được thao tác giới hạn', '2023-07-11 02:46:26', NULL),
(16, 16, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-11 02:47:19', NULL),
(17, 17, 'user', 'Người dùng được thao tác giới hạn', '2023-07-11 03:04:02', NULL),
(18, 18, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-11 03:05:02', NULL),
(19, 19, 'user', 'Người dùng được thao tác giới hạn', '2023-07-11 03:12:03', NULL),
(20, 20, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-25 07:19:06', NULL),
(21, 21, 'admin', 'Quyền quản trị cao nhất, được thao tác toàn bộ', '2023-07-25 07:23:25', NULL);



INSERT INTO `save_image` (`user_id`, `image_id`, `created_at`, `updated_at`) VALUES
(7, 1, '2023-07-05 09:22:40', NULL);
INSERT INTO `save_image` (`user_id`, `image_id`, `created_at`, `updated_at`) VALUES
(7, 2, '2023-07-05 09:24:19', NULL);
INSERT INTO `save_image` (`user_id`, `image_id`, `created_at`, `updated_at`) VALUES
(7, 3, '2023-07-05 09:24:21', NULL);
INSERT INTO `save_image` (`user_id`, `image_id`, `created_at`, `updated_at`) VALUES
(7, 5, '2023-07-05 09:24:24', NULL),
(11, 5, '2023-07-10 15:42:29', NULL),
(11, 6, '2023-07-10 15:42:33', NULL),
(11, 7, '2023-07-10 15:42:38', NULL),
(17, 7, '2023-07-11 03:19:19', NULL),
(17, 8, '2023-07-11 03:19:24', NULL),
(17, 9, '2023-07-11 03:19:29', NULL),
(17, 10, '2023-07-11 03:19:39', NULL);

INSERT INTO `session` (`session_id`, `user_id`, `token`, `is_online`, `login_at`, `logout_at`) VALUES
(1, 5, 'expires', 0, '2023-07-05 04:00:50', '2023-07-05 04:01:41');
INSERT INTO `session` (`session_id`, `user_id`, `token`, `is_online`, `login_at`, `logout_at`) VALUES
(2, 5, 'expires', 0, '2023-07-05 04:01:41', '2023-07-05 07:32:18');
INSERT INTO `session` (`session_id`, `user_id`, `token`, `is_online`, `login_at`, `logout_at`) VALUES
(3, 6, 'expires', 0, '2023-07-05 04:32:37', '2023-07-10 15:55:28');
INSERT INTO `session` (`session_id`, `user_id`, `token`, `is_online`, `login_at`, `logout_at`) VALUES
(4, 7, 'expires', 0, '2023-07-05 04:32:40', '2023-07-05 09:17:38'),
(5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEsImVtYWlsIjoiaHVuZzEiLCJyb2xlX25hbWUiOiJhZG1pbiIsInJvbGVfZGVzYyI6IlF1eeG7gW4gcXXhuqNuIHRy4buLIGNhbyBuaOG6pXQsIMSRxrDhu6NjIHRoYW8gdMOhYyB0b8OgbiBi4buZIn0sImlhdCI6MTY4ODUzNDAzNCwiZXhwIjoxNjkxMTI2MDM0fQ.TIIQ0ztJCYgrT-3W-AK6MGm91m5VaqN33nbG4cVYi0s', 1, '2023-07-05 05:13:55', NULL),
(6, 5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjUsImVtYWlsIjoiaHVuZzUiLCJyb2xlX25hbWUiOiJ1c2VyIiwicm9sZV9kZXNjIjoiTmfGsOG7nWkgZMO5bmcgxJHGsOG7o2MgdGhhbyB0w6FjIGdp4bubaSBo4bqhbiJ9LCJpYXQiOjE2ODg1NDIzMzgsImV4cCI6MTY5MTEzNDMzOH0.R9y3QF_EZS1yyUo3otO1rmXdoOBbHSLwlii2SwbAkiY', 1, '2023-07-05 07:32:19', NULL),
(7, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjMsImVtYWlsIjoiaHVuZzMiLCJyb2xlX25hbWUiOiJ1c2VyIiwicm9sZV9kZXNjIjoiTmfGsOG7nWkgZMO5bmcgxJHGsOG7o2MgdGhhbyB0w6FjIGdp4bubaSBo4bqhbiJ9LCJpYXQiOjE2ODg1NDgyNzEsImV4cCI6MTY5MTE0MDI3MX0.iTOi0nIv3soh_ujdoMag2_SGbkh-aMfu9D90wNmXUaU', 1, '2023-07-05 09:11:11', NULL),
(8, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjQsImVtYWlsIjoiaHVuZzQiLCJyb2xlX25hbWUiOiJ1c2VyIiwicm9sZV9kZXNjIjoiTmfGsOG7nWkgZMO5bmcgxJHGsOG7o2MgdGhhbyB0w6FjIGdp4bubaSBo4bqhbiJ9LCJpYXQiOjE2ODg1NDgzMTcsImV4cCI6MTY5MTE0MDMxN30.BLh8vcyzuGoHSySXX3iX6Zs1sJ3eakccmCudfxN9Vz4', 1, '2023-07-05 09:11:58', NULL),
(9, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjcsImVtYWlsIjoiaHVuZzciLCJyb2xlX25hbWUiOiJ1c2VyIiwicm9sZV9kZXNjIjoiTmfGsOG7nWkgZMO5bmcgxJHGsOG7o2MgdGhhbyB0w6FjIGdp4bubaSBo4bqhbiJ9LCJpYXQiOjE2ODg1NDg2NTgsImV4cCI6MTY5MTE0MDY1OH0.2wdaG2hfrBUAfgw6CpWtUrX7VA8sYm06ZATb0zPwTsk', 1, '2023-07-05 09:17:38', NULL),
(10, 11, 'expires', 0, '2023-07-10 14:54:30', '2023-07-10 15:10:28'),
(11, 11, 'expires', 0, '2023-07-10 15:10:49', '2023-07-10 15:11:15'),
(12, 11, 'expires', 0, '2023-07-10 15:11:16', '2023-07-11 03:31:15'),
(13, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEyLCJlbWFpbCI6Imh1bmcxMiIsInJvbGVfbmFtZSI6ImFkbWluIiwicm9sZV9kZXNjIjoiUXV54buBbiBxdeG6o24gdHLhu4sgY2FvIG5o4bqldCwgxJHGsOG7o2MgdGhhbyB0w6FjIHRvw6BuIGLhu5kifSwiaWF0IjoxNjg5MDAxOTk2LCJleHAiOjE2OTE1OTM5OTZ9.46lRMWCju__b0CPdLR8ZjcjyzXLHIb5MCJzF1IAiFLM', 1, '2023-07-10 15:13:17', NULL),
(14, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjYsImVtYWlsIjoiaHVuZzYiLCJyb2xlX25hbWUiOiJ1c2VyIiwicm9sZV9kZXNjIjoiTmfGsOG7nWkgZMO5bmcgxJHGsOG7o2MgdGhhbyB0w6FjIGdp4bubaSBo4bqhbiJ9LCJpYXQiOjE2ODkwMDQ1MjgsImV4cCI6MTY5MTU5NjUyOH0.jGKPuro84V2bQbfPCkxwg35Cu9qg3JGV4t2SFhAfU5g', 1, '2023-07-10 15:55:28', NULL),
(15, 15, 'expires', 0, '2023-07-11 02:48:14', '2023-07-11 02:52:37'),
(16, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjE1LCJlbWFpbCI6Imh1bmcxNSIsInJvbGVfbmFtZSI6InVzZXIiLCJyb2xlX2Rlc2MiOiJOZ8aw4budaSBkw7luZyDEkcaw4bujYyB0aGFvIHTDoWMgZ2nhu5tpIGjhuqFuIn0sImlhdCI6MTY4OTA0Mzk3OCwiZXhwIjoxNjkxNjM1OTc4fQ.QHchiatvDXjlPmU5sxqDMssFAdF3Xwo8zHtO_756Tsg', 1, '2023-07-11 02:52:58', NULL),
(17, 17, 'expires', 0, '2023-07-11 03:05:54', '2023-07-11 03:09:48'),
(18, 17, 'expires', 0, '2023-07-11 03:09:49', '2023-07-11 03:16:39'),
(19, 18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjE4LCJlbWFpbCI6Imh1bmcxOCIsInJvbGVfbmFtZSI6ImFkbWluIiwicm9sZV9kZXNjIjoiUXV54buBbiBxdeG6o24gdHLhu4sgY2FvIG5o4bqldCwgxJHGsOG7o2MgdGhhbyB0w6FjIHRvw6BuIGLhu5kifSwiaWF0IjoxNjg5MDQ1MTA0LCJleHAiOjE2OTE2MzcxMDR9.dOMNAyNvNU7Xd_D4yeJkPpa2TbRIlhmDjR-4bvIBDS0', 1, '2023-07-11 03:11:45', NULL),
(20, 17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjE3LCJlbWFpbCI6Imh1bmcxNyIsInJvbGVfbmFtZSI6InVzZXIiLCJyb2xlX2Rlc2MiOiJOZ8aw4budaSBkw7luZyDEkcaw4bujYyB0aGFvIHTDoWMgZ2nhu5tpIGjhuqFuIn0sImlhdCI6MTY4OTA0NTM5OSwiZXhwIjoxNjkxNjM3Mzk5fQ.oIy_cdb3QlH-PSXGJ9_eVQ91MTdBcWnH5lXZSckNpuM', 1, '2023-07-11 03:16:40', NULL),
(21, 8, 'expires', 0, '2023-07-11 03:27:52', '2023-07-11 03:29:45'),
(22, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjgsImVtYWlsIjoiaHVuZzgiLCJyb2xlX25hbWUiOiJjZWxlYnJpdHkiLCJyb2xlX2Rlc2MiOiJOZ8aw4budaSBu4buVaSB0aeG6v25nLCDEkcaw4bujYyB1c2VyIG5o4bqlbiB0aGVvIGTDtWkifSwiaWF0IjoxNjg5MDQ2MTg1LCJleHAiOjE2OTE2MzgxODV9.e4-VluWOEdscZPpGoCJY3zpPa9QTa8ILdmAEYDFMSF4', 1, '2023-07-11 03:29:46', NULL),
(23, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjExLCJlbWFpbCI6Imh1bmcxMSIsInJvbGVfbmFtZSI6InVzZXIiLCJyb2xlX2Rlc2MiOiJOZ8aw4budaSBkw7luZyDEkcaw4bujYyB0aGFvIHTDoWMgZ2nhu5tpIGjhuqFuIn0sImlhdCI6MTY4OTA0NjI3NSwiZXhwIjoxNjkxNjM4Mjc1fQ.yAzfurfivRUP_kEUNHC6ThHEZd3tZuth_VtviU9sgQI', 1, '2023-07-11 03:31:15', NULL);

INSERT INTO `user` (`user_id`, `email`, `pass_word`, `full_name`, `avatar`, `is_active`) VALUES
(1, 'hung1', '$2b$10$sJNV3MsMTEjwBte1H1dPOezPnbeo1hqCUr8xDO4cdc4BpDQkhk6La', 'hung1', '/public/default/default-avatar.png', 1);
INSERT INTO `user` (`user_id`, `email`, `pass_word`, `full_name`, `avatar`, `is_active`) VALUES
(2, 'hung2', '$2b$10$Z9x2ySV5oUghgj0RyJKErOL9OOelPPxqWh47y5/PC.AlNEg6LaXp.', 'hung2', '/public/default/default-avatar.png', 1);
INSERT INTO `user` (`user_id`, `email`, `pass_word`, `full_name`, `avatar`, `is_active`) VALUES
(3, 'hung3', '$2b$10$cJNluz8UzOO9MbSnrBvFqu0Bhz/p7nWZXxityAzMtZJVgBRs0qqve', 'hung3', '/public/default/default-avatar.png', 0);
INSERT INTO `user` (`user_id`, `email`, `pass_word`, `full_name`, `avatar`, `is_active`) VALUES
(4, 'hung4', '$2b$10$AoY7cn21AsSKcmxUh8UkKeOhRrI2ULYVpWSvpIPPTSt3DYvmDzktW', 'hung4', '/public/default/default-avatar.png', 0),
(5, 'hung5', '$2b$10$P8D7oiwpC605H7DMBauQTuoElyfcobE6DDzPowzvbXcA4AouHo0hy', 'hung5', '/public/default/default-avatar.png', 1),
(6, 'hung6', '$2b$10$/9zKprBRMeHuNyVnmnZ82eCvrVntWS7tYSwV6aADCnwvguOSo6MDa', 'hung6', '/public/default/default-avatar.png', 1),
(7, 'hung7', '$2b$10$xJbdeHA6nTON56HXSJsRpehKhrsKlAu6zU48Lbyv9rkmroJtBQpC6', 'hung7', '1688532629208_sơ ri.jpg', 1),
(8, 'hung8', '$2b$10$fQaD/Bxs1MWwtH27bMEqiucnbfqpFfjJtfd4zBbQHCHJ1Mc1ewVT.', 'hung8', '/public/default/default-avatar.png', 1),
(9, 'hung9', '$2b$10$RcbJI35dH14T0m35ggcPg.m5EUh4bWFFvfTdep2gs6aMcElbpANLe', 'hung9', '/public/default/default-avatar.png', 1),
(10, 'hung10', '$2b$10$hGi6k8th/cJhfe7yn2jW7OMnGURyOsTZI9SfVsnLcZy/V1NXGLgxK', 'hung10', '/public/default/default-avatar.png', 1),
(11, 'hung11', '$2b$10$nuDhqTiYOZUcwb7ia9lC3epLxdses/e/N6fkABFoCJrhwlyKpaSzO', 'hung11', '1689001250335_squirtle.png', 1),
(12, 'hung12', '$2b$10$5gVtgWHA6QYeBeHrPXoL1uETT16zbAMYXIzkBeliUoTRc0kGC6wx6', 'hung12', '/public/default/default-avatar.png', 1),
(13, 'hung13', '$2b$10$.dxs0RT09sZnH8H/mfY0sekJB1hiqGDDYdybmO.50gpztiVhVJFJi', 'hung13', '/public/default/default-avatar.png', 1),
(14, 'hung14', '$2b$10$oQAZiIwFI/MQkKenuXeu3uBscvVW5A6a73WXBU1YiphxJbX5A/uji', 'hung14', '/public/default/default-avatar.png', 1),
(15, 'hung15', '$2b$10$IDKTON5qENArDl1gqXPfK.D49JhsSDK.qJVMSJiksNk8FEuytQ/Fa', 'hung15', '1689043838924_ironman-1.jpg', 1),
(16, 'hung16', '$2b$10$LxR63V02R7O92KsMzRm6TO28rrud4ZJ.F/T5uieBkdqIoeo7e9c2i', 'hung16', '/public/default/default-avatar.png', 1),
(17, 'hung17', '$2b$10$c.qLAZSPJXw1qFzyMP5CgOqwA7qAfnMyL4C1KZld5l4Vk8BEBwGfW', 'hung17', '1689044892446_squirtle.png', 1),
(18, 'hung18', '$2b$10$u6BaqaClFyuxdyAZYa3sQu6Rg54z44QymGi6TNR.obmLxbG7f1lla', 'hung18', '/public/default/default-avatar.png', 1),
(19, 'hung19', '$2b$10$WxJ0cU2BpIUL0jb0dNkT7eaPTd9WndsPn4D1uBQ49JIJRygXMXSNS', 'hung19', '/public/default/default-avatar.png', 1),
(20, 'hung20', '$2b$10$WMcbD2ABynq6QKTqPeqST.MVozXFTK4dxEoaSbNlPzm3YBYs0O7IC', 'hung20', '/public/default/default-avatar.png', 1),
(21, 'hung21', '$2b$10$CoFDZo/Iz9cjBDUetce4hu9sEvVeZdITwQnTcckC75JyiJ8AQdy1a', 'hung aaa', '/public/default/default-avatar.png', 1);



INSERT INTO `user_info` (`user_id`, `age`, `cover_image`, `gender`, `country`, `study_at`, `working_at`, `favorites`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 03:58:40', NULL);
INSERT INTO `user_info` (`user_id`, `age`, `cover_image`, `gender`, `country`, `study_at`, `working_at`, `favorites`, `created_at`, `updated_at`) VALUES
(2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 03:59:31', NULL);
INSERT INTO `user_info` (`user_id`, `age`, `cover_image`, `gender`, `country`, `study_at`, `working_at`, `favorites`, `created_at`, `updated_at`) VALUES
(3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 03:59:36', NULL);
INSERT INTO `user_info` (`user_id`, `age`, `cover_image`, `gender`, `country`, `study_at`, `working_at`, `favorites`, `created_at`, `updated_at`) VALUES
(4, 25, NULL, 'female', 'usa', 'florida', NULL, NULL, '2023-07-05 03:59:39', '2023-07-05 07:20:41'),
(5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 03:59:42', NULL),
(6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 04:20:58', NULL),
(7, 20, '1688532953567_squirtle.png', 'male', 'viet nam', 'thhcm', 'sg', 'football', '2023-07-05 04:24:15', '2023-07-05 04:55:53'),
(8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 05:16:44', NULL),
(9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-05 05:18:18', NULL),
(10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-10 02:42:28', NULL),
(11, 20, '1689001466801_ironman-1.jpg', 'male', 'viet nam', 'thhcm', 'sg', 'football', '2023-07-10 14:51:05', '2023-07-10 15:04:26'),
(12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-10 14:53:07', NULL),
(13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-10 15:14:13', NULL),
(14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-11 02:42:38', NULL),
(15, 20, NULL, 'male', 'viet nam', 'thhcm', 'sg', 'football', '2023-07-11 02:46:26', '2023-07-11 02:49:44'),
(16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-11 02:47:19', NULL),
(17, 25, NULL, 'male', 'viet nam', 'thhcm', 'sai gon', 'football', '2023-07-11 03:04:02', '2023-07-11 03:07:00'),
(18, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-11 03:05:02', NULL),
(19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-11 03:12:03', NULL),
(20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-25 07:19:06', NULL),
(21, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-25 07:23:25', NULL);


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;