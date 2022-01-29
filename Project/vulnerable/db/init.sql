CREATE DATABASE CARDS;
USE CARDS;

CREATE TABLE USERS(
	PERSON_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	USER VARCHAR(40) NOT NULL,
	PASS VARCHAR(40) NOT NULL,
	MSG VARCHAR(500) NOT NULL
);

INSERT INTO USERS(USER, PASS, MSG) VALUES('admin', 'parola', '<img src="https://www.bbva.com/wp-content/uploads/2020/05/hack_webcam-1920x1180.jpg" onmouseover=alert("HACKED")>');
INSERT INTO USERS(USER, PASS, MSG) VALUES('gigel', 'parola', '<script>alert("HACKED!");</script>');
