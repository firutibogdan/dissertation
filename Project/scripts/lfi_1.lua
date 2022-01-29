wrk.method = "POST"
wrk.body   = "{\"username\": \"admin1\", \"path\": \"/etc/passwd\", \"safeness\": 1}"
wrk.headers["Content-Type"] = "application/json"