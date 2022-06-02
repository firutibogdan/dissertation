CREATE DATABASE CARDS;
USE CARDS;



CREATE TABLE USERS(
	PERSON_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	NAME VARCHAR(200) NOT NULL,
	USER VARCHAR(200) NOT NULL,
	PASS VARCHAR(200) NOT NULL
);

CREATE TABLE MESSAGES(
	MESSAGE_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	USER VARCHAR(200) NOT NULL,
	MSG TEXT(100000) NOT NULL
);

/* add users */
INSERT INTO USERS(NAME, USER, PASS) VALUES('MVP', '25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7', 'a80b568a237f50391d2f1f97beaf99564e33d2e1c8a2e5cac21ceda701570312');
INSERT INTO USERS(NAME, USER, PASS) VALUES('J0k3R', 'admin', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('D3adP00l', 'admin1', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('Xenic', 'admin10', '!%$''parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('BlueJeans', 'admin100', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('Faker', 'admin1000', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('J0Hn', 'admin10000', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('Joshua', 'admin100000', 'parola');
INSERT INTO USERS(NAME, USER, PASS) VALUES('John', 'john', 'password');

/* add messages */
INSERT INTO MESSAGES(USER, MSG) VALUES('25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7', 'I am the real MVP');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin', 'Be silent, please!');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin1','Is this a joke to you?');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin10', 'Hmm, how can we hack this webpage?');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin100', 'Too late! It is already <b>hacked</b> by <i><b>XSS</b></i>!');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin1000', 'Whaat? How did you do that?');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin10000', 'Teach him, please!');
INSERT INTO MESSAGES(USER, MSG) VALUES('admin100000', 'Are you kidding me? I spent 5 years developing this...');
INSERT INTO MESSAGES(USER, MSG) VALUES('john', 'Go ahead...Do what you have to do...Hack this again!');