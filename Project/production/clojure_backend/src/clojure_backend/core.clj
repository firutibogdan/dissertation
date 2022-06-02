(ns clojure-backend.core
  (:require [org.httpkit.server :as server]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer :all]
            [ring.middleware.cors :refer :all]
            [clojure.pprint :as pp]
            [clojure.string :as str]
            [clojure.data.json :as json]
            [clojure.java.jdbc :as j]
            [buddy.core.hash :as hash]
            [buddy.core.codecs :as codecs]
            [clojure.pprint :as p])
  (:gen-class)
  (:import (com.mchange.v2.c3p0 ComboPooledDataSource))
  )

(use '[ring.middleware.json :only [wrap-json-body]]
     '[ring.util.response :only [response, content-type]])

(def db-spec
  {:classname "com.mysql.jdbc.Driver"
    :subprotocol "mysql"
    :subname "//db:3306/CARDS"
    :user "root"
    :password "password"
    :multi-rs true})

(defn pool
  [spec]
  (let [cpds (doto (ComboPooledDataSource.)
                (.setDriverClass (:classname spec))
                (.setJdbcUrl (str "jdbc:" (:subprotocol spec) ":" (:subname spec)))
                (.setUser (:user spec))
                (.setPassword (:password spec))
                ;; expire excess connections after 30 minutes of inactivity:
                (.setMaxIdleTimeExcessConnections (* 30 60))
                ;; expire connections after 3 hours of inactivity:
                (.setMaxIdleTime (* 3 60 60)))]
    {:datasource cpds}))

(def pooled-db (delay (pool db-spec)))

(defn db-connection [] @pooled-db)

; login handler
(defn login_handler [req]
  (let [username (get-in req [:body :username])
        password (get-in req [:body :password])]
  (response (if (empty? 
      (j/query (db-connection) ;mysql-db
        [(format "select * from users where user = '%s' and pass = '%s'"
          username password
        )]
        {:row-fn :user}))
      "Try harder next time!"
      "Good Job! You managed to log in!"
    ))))

; messages handler
(defn messages_handler [req]
  (response 
    (apply str
      (j/query (db-connection) ;mysql-db
        [(format "select users.name, messages.msg from users inner join messages on users.user = messages.user order by messages.message_id")])
    )
  )
)

; message handler
(defn message_handler [req]
  (let [username (get-in req [:body :username])
        message (get-in req [:body :message])]
    (response 
      (apply str
        (j/insert! (db-connection) ;mysql-db
          :messages
          [:user, :msg]
          [username, message])
      )
    )
  )
)

; profile handler
(defn profile_handler [req]
  (let [username (get-in req [:body :username])
        ;; _ (p/pprint username)
       ]
    (response 
      (apply str
          (j/query (db-connection) ;mysql-db
            [(format "select name, user from users where user = '%s'" username)])
      )
    )
  )
)

; path traversal handler
(defn download_handler [req]
  (let [path (get-in req [:body :path])]
  (response (slurp  path))))

(defroutes app-routes
  (POST "/login" [] (wrap-json-body login_handler {:keywords? true :bigdecimals? true}))
  (POST "/profile" [] (wrap-json-body profile_handler {:keywords? true :bigdecimals? true}))
  (POST "/message" [] (wrap-json-body message_handler {:keywords? true :bigdecimals? true}))
  (GET "/messages" [] (wrap-json-body messages_handler {:keywords? true :bigdecimals? true}))
  (POST "/download" [] (wrap-json-body download_handler {:keywords? true :bigdecimals? true}))
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
