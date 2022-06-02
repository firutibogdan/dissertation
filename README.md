## dissertation project

# Investigate web vulnerabilities
* SQL Injection
* Cross Site Scripting (XSS)
* Path Traversal

# Technologies used
* MySQL database
* Python3 + Flask
* VueJS + ExpressJS
* AngularJS + MeteorJS
* ReactJS + NextJS
* Elm + Clojure

# Description
After seeing numerous attacks on webservers, I found out about functional programming in web, so I wanted to try and explore some of the most classical attacks.

SQL Injection and Cross Site Scripting are still in top OWASP, while Path Traversal is not that common nowadays.

I wanted to check if these 3 vulnerabilities are still "permitted" by the new Javascript Frameworks and also by the new direction in web programming. Elm, Clojure and other frameworks started to take advantage of the features functional programming bring to life.

# Experiment
Run the docker using **docker-compose up** and then open the browser.
##### Python3 + Flask
* http://localhost:8080/login (for this, you will need to make a POST request that sends a form with 2 fields "username" = "admin ' -- test" and "password" = "anything you want here") (you can use somethin like Postman for this)
* http://localhost:8080/show_xss?username=admin
* http://localhost:8080/path_traversal?path=../../../../../../../../../../../../../../../../etc/passwd

##### VueJS + ExpressJS
Use as username **admin ' -- test** and no password for login
Use nothing for XSS hack (ex. <iframe src=http://xss.rocks/scriptlet.html></iframe>)
Use **../../../../../../../../../../../../../../../../etc/passwd** for path for Path Traversal
* http://localhost:8081

##### AngularJS + MeteorJS
Use as username **admin ' -- test** and no password for login
Use nothing for XSS hack (ex. <iframe src=http://xss.rocks/scriptlet.html></iframe>)
Use **../../../../../../../../../../../../../../../../etc/passwd** for path for Path Traversal
* http://localhost:8082

##### ReactJS + NextJS
Use as username **admin ' -- test** and no password for login
Use nothing for XSS hack (ex. <iframe src=http://xss.rocks/scriptlet.html></iframe>)
Use **../../../../../../../../../../../../../../../../etc/passwd** for path for Path Traversal
* http://localhost:8083

##### Elm + Clojure
Use as username **admin ' -- test** and no password for login
XSS is not really working here :D
Use **../../../../../../../../../../../../../../../../etc/passwd** for path for Path Traversal
* http://localhost:8084