
```bash
curl -X POST http://192.168.61.72:/std/add-student \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "roll": "101", "address": "Dhaka"}'
```

```bash
curl -X POST http://192.168.61.72:/tech/add-teacher \
  -H "Content-Type: application/json" \
  -d '{"name": "Mr. Smith", "id": "2301", "subject": "Science"}'
 ``` 
 ```bash
curl -X POST http://192.168.61.72:/emp/add-employee \
  -H "Content-Type: application/json" \
  -d '{"name": "David", "id": "301", "position": "Accountant"}'
```