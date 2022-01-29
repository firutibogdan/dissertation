wrk.method = "POST"
wrk.body   = "{\"username\": \"admin1\", \"path\": \"/etc/passwd\", \"safeness\": 0}"
wrk.headers["Content-Type"] = "application/json"