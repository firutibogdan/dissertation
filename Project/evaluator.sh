#!/bin/bash

PYTHON="http://127.0.0.1:8080/"
EXPRESS="http://127.0.0.1:3080/api/"
METEOR="http://127.0.0.1:3000/api/"
NEXT="http://127.0.0.1:3001/api/"
CLOJURE="http://127.0.0.1:3002/"

rm -rf results
touch results

# different servers
for domain in $METEOR #$PYTHON $EXPRESS $METEOR $NEXT $CLOJURE
do
        # sql injection
        url_sql=$domain"login"

        # scripts for safeness_level
        for script in "scripts/sql_0.lua" "scripts/sql_1.lua" "scripts/sql_2.lua" "scripts/sql_3.lua"
        do
                # 10 20 seconds run
                for d in '10' '30'
                do
                        # keep alive or not
                        for H in "Connection: Keep-Alive" "Connection: Close"
                        do
                                # 3 runs
                                for i in '1' '2' '3'
                                do
                                        echo -n "1 $d $H $script $url_sql $i " >> results
                                        wrk -t 1 -c 1 -d $d -H "$H" -s $script $url_sql | grep "Requests/sec:" >> results
                                done
                        done
                done
        done

        # XSS
        url_xss=$domain"show_xss"
        # scripts for safeness_level

        for script in "scripts/xss_0.lua" "scripts/xss_1.lua" "scripts/xss_2.lua"
        do
                # 10 20 seconds run
                for d in '10' '30'
                do
                        # keep alive or not
                        for H in "Connection: Keep-Alive" "Connection: Close"
                        do
                                # 3 runs
                                for i in '1' '2' '3'
                                do
                                        echo -n "1 $d $H $script $url_xss $i " >> results
                                        wrk -t 1 -c 1 -d $d -H "$H" -s $script $url_xss | grep "Requests/sec:" >> results
                                done
                        done
                done
        done

        # Path Traversal
        url_lfi=$domain"path_traversal"

        # scripts for safeness_level
        for script in "scripts/lfi_0.lua" "scripts/lfi_1.lua" "scripts/lfi_2.lua" "scripts/lfi_3.lua"
        do
                # 10 20 seconds run
                for d in '10' '30'
                do
                        # keep alive or not
                        for H in "Connection: Keep-Alive" "Connection: Close"
                        do
                                # 3 runs
                                for i in '1' '2' '3'
                                do
                                        echo -n "1 $d $H $script $url_lfi $i " >> results
                                        wrk -t 1 -c 1 -d $d -H "$H" -s $script $url_lfi | grep "Requests/sec:" >> results
                                done
                        done
                done
        done
done