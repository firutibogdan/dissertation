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
            [buddy.core.codecs :as codecs])
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


; SQL Injection no sanitize
(defn sql_injection_solution_0 [info] info)

; SQL Injection sanitize and keep only 0-9a-zA-Z
(defn sql_injection_solution_1 [info] (apply str (filter #(Character/isLetter %) info)))

; SQL Injection sanitize character '
(defn sql_injection_solution_2 [info] (clojure.string/replace info "'" "''"))

; SQL Injection hash input
(defn sql_injection_solution_3 [info] (-> (hash/sha256 info) (codecs/bytes->hex)))

; login handler
(defn login_handler [req]
  (let [username (get-in req [:body :username])
        password (get-in req [:body :password])
        safeness (get-in req [:body :safeness])
       ]
  (response (if (empty? 
      (j/query (db-connection) ;mysql-db
        [(format "select * from users where user = '%s' and pass = '%s'"
          (if (== safeness 1)
            (sql_injection_solution_1 username)
            (if (== safeness 2)
              (sql_injection_solution_2 username)
              (if (== safeness 3)
                (sql_injection_solution_3 username)
                (sql_injection_solution_0 username)
              )
            )
          )
          (if (== safeness 1)
            (sql_injection_solution_1 password)
            (if (== safeness 2)
              (sql_injection_solution_2 password)
              (if (== safeness 3)
                (sql_injection_solution_3 password)
                (sql_injection_solution_0 password)
              )
            )
          )
        )]
        {:row-fn :user}))
      "Try harder next time!"
      "Good Job! You managed to log in!"
    ))))



; XSS no sanitization
(defn xss_solution_0 [message] message)

; XSS sanitize input
(defn xss_solution_1 [message] 
  (clojure.string/replace
    (clojure.string/replace
      (clojure.string/replace
        (clojure.string/replace
          (clojure.string/replace
            (clojure.string/replace message "&" "&amp;")
            ">" "&gt;"
          )
          "<" "&lt;"
        )
        "\"" "&quot;"
      )
      "/" "&#47;"
    )
    "'" "&#39;"
  )
)

; xss handler
(defn xss_handler [req]
  (let [username (get-in req [:body :username])
        safeness (get-in req [:body :safeness])
  ]
  (if (== safeness 2)
    (content-type (response (apply str
                              (j/query (db-connection) ;mysql-db
                                [(format "select * from users where user = '%s'" username)]
                                {:row-fn :msg})
                            )
                  ) "text/plain"
    )
    (response 
      (if (== safeness 1)
        (xss_solution_1 (apply str
                          (j/query (db-connection) ;mysql-db
                            [(format "select * from users where user = '%s'" username)]
                            {:row-fn :msg})
                        ))
        (xss_solution_0 (apply str
                          (j/query (db-connection) ;mysql-db
                            [(format "select * from users where user = '%s'" username)]
                            {:row-fn :msg})
                      ))
      )
    )
  )
  )
)

; PathTraversa no sanitization
(defn lfi_solution_0 [path_arg] path_arg)

;; ; PathTraversa sanitize input
(defn lfi_solution_1 [path_arg] (clojure.string/replace (clojure.string/replace path_arg ".." "") "/" ""))

; PathTraversa hash filename
(defn lfi_solution_2 [path_arg] (str "/file_" (-> (hash/md5 path_arg) (codecs/bytes->hex)) ".txt"))

; PathTraversa check if access permitted in database
(defn lfi_solution_3 [username path_arg]
    (if (== (get-in (j/query (db-connection) ;mysql-db
                          [(format "SELECT COUNT(*) AS OK FROM FILES WHERE FILES.USER = '%s' AND FILES.FILE_PATH = '%s';" username path_arg)]
                          {:result-set-fn first})
                  [:ok]
                  ) 1)
      path_arg
      "")
)

; path traversal handler
(defn path_traversal_handler [req]
  (let [username (get-in req [:body :username])
        safeness (get-in req [:body :safeness])
        path (get-in req [:body :path])
      ]
  (response (slurp  (if (== safeness 1)
                      (lfi_solution_1 path)
                      (if (== safeness 2)
                        (lfi_solution_2 path)
                        (if (== safeness 3)
                          (lfi_solution_3 username path)
                          (lfi_solution_0 path)
                        )
                      )
                    )
    ))))

(defroutes app-routes
  (POST "/login" [] (wrap-json-body login_handler {:keywords? true :bigdecimals? true}))
  (POST "/show_xss" [] (wrap-json-body xss_handler {:keywords? true :bigdecimals? true}))
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
