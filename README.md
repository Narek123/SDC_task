## Running the app
```bash
$ docker-compose up
```
## Api
```
GET [tree list] http://localhost:3001/category

GET [tree item] http://localhost:3001/category/{id}

GET [parents and children of item] http://localhost:3001/category/tree/{id}

POST [create item] <http://localhost:3001/category

patch [update item] http://localhost:3001/category/{id}

delete [delete item] http://localhost:3001/category/{id}
