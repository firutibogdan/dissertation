wrk.method = "POST"
wrk.body   = "{\"username\": \"admin1 \' -- \", \"password\": \"test\", \"safeness\": 0}"
wrk.headers["Content-Type"] = "application/json"