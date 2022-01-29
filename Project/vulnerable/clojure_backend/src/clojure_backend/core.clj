(ns clojure-backend.core
  (:require [org.httpkit.server :as server]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer :all]
            [ring.middleware.cors :refer :all]
            [clojure.pprint :as pp]
            [clojure.string :as str]
            [clojure.data.json :as json]
            [clojure.java.jdbc :as j])
  (:gen-class))

(use '[ring.middleware.json :only [wrap-json-body]]
     '[ring.util.response :only [response]])


(def mysql-db
  {
    :dbtype "mysql"
    :dbname "CARDS"
    :host "db"
    :user "root"
    :password "password"
  })

; login handler
(defn login_handler [req]
  (let [username (get-in req [:body :username])
        password (get-in req [:body :password])]
  (response (if (empty? 
      (j/query mysql-db
        [(format "select * from users where user = '%s' and pass = '%s'" username password)]
        {:row-fn :user}))
      "Try harder next time!"
      "Good Job! You managed to log in!"
    ))))

; xss handler
(defn xss_handler [req]
  (response (apply str
      (j/query mysql-db
        ["select * from users where user = 'admin'"]
        {:row-fn :msg}))
    ))

; path traversal handler
(defn path_traversal_handler [req]
  (let [path (get-in req [:body :path])]
  (response (slurp path))))

(defroutes app-routes
  (POST "/login" [] (wrap-json-body login_handler {:keywords? true :bigdecimals? true}))
  (GET "/show_xss" [] xss_handler)
  (POST "/path_traversal" [] (wrap-json-body path_traversal_handler {:keywords? true :bigdecimals? true}))
  (route/not-found "Error, page not found!"))

(def app
  (-> app-routes
    (wrap-cors
      :access-control-allow-origin [#".*"]
      :access-control-allow-methods [:get :put])))

(defn -main
  "This is our main entry point"
  [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (server/run-server #'app {:port 3000, :host "0.0.0.0"})
    (println (str "Running webserver at http://0.0.0.0:3000/"))))
