# React

-----frontend dev--------


-----frontend production------
npm install
npm run build
npm start

------for backend dev---------
yarn 
yarn run dev

--------for backend production------
yarn
yarn run build
yarn start


## Connect to mongo then create application database,user,password and import data

```
use eticket

db.createUser({
  user: "eticket",
  pwd: "eticket",
  roles: [{ role: "readWrite", db: "eticket" }]
})
```
## Create a Temporary pod for connection test and try ti connect headless service
`kubectl run -i --tty --rm debug-mongo --image=mongo --restart=Never -- bash`

```
apt update
apt install iputils-ping
apt install dnsutils
```

`mongosh mongodb-sts-0.eticker-mongodb.default.svc.cluster.local:27017/admin --username root --password Password`

`mongosh mongodb-sts-0.eticker-mongodb.default.svc.cluster.local:27017/eticket --username eticket --password eticket`

**Insert Data into eticket DB**

`use eticket;`

For users collection

```
db.users.insertOne({
  "_id": ObjectId("655cfdad690ee6dbcf525a81"),
  "name": "Abul Hasan",
  "email": "test@gmail.com",
  "password": "$2a$10$8yFjwr7V8yb5n.WyJtzAf.i5/RzuGfPOqDEQYMGq9F3wrZGTAx1kC",
  "role": "user",
  "isVerified": false,
  "createdAt": ISODate("2023-11-21T18:57:49.955Z"),
  "updatedAt": ISODate("2023-11-21T18:57:49.955Z"),
  "__v": 0
});
```

For buses collection

```
db.buses.insertMany([
  {
    "_id": ObjectId("654cb971d382d2c0bf18512e"),
    "busName": "Hanif Enterprise",
    "busType": "non_ac",
    "numberOfSeat": 40,
    "isAvailableForTrip": false,
    "isTripBooked": false,
    "__v": 0
  },
  // Repeat the same pattern for other bus documents...
]);
```

For routes collection

```
db.routes.insertMany([
  {
    "_id": ObjectId("65488f460e04152897f33d21"),
    "locationName": "dinajpur",
    "__v": 0
  },
  {
    "_id": ObjectId("65488f5e0e04152897f33d27"),
    "locationName": "barguna",
    "__v": 0
  },
  // Repeat the same pattern for other route documents...
]);

```

For trips collection

```
db.trips.insertMany([
  {
    "_id": ObjectId("6557b1db539a20b1e7d5db1f"),
    "busId": ObjectId("6553cc5bad7d5abb7402255c"),
    "fromId": ObjectId("6553b6fe6f0323bd7bd087d4"),
    "toId": ObjectId("6553bb566f0323bd7bd08818"),
    "from": "dhaka-Saydabad",
    "to": "barishal-Notullabad",
    "busName": "T.R Travels",
    "departure_time": ISODate("2023-11-21T14:00:07.901Z"),
    "price": "530",
    "busType": "ac",
    "numberOfSeat": "36",
    "passengers": [],
    "__v": 0
  },
  {
    "_id": ObjectId("6558bb7b0046a14358f567eb"),
    "busId": ObjectId("6553ca87ad7d5abb74022546"),
    "fromId": ObjectId("6552d567d3fe97e09d3352a2"),
    "toId": ObjectId("6552d573d3fe97e09d3352a6"),
    "from": "kuakata",
    "to": "cox's Bazar",
    "busName": "Shohag Paribahan",
    "departure_time": ISODate("2023-11-20T13:30:02.559Z"),
    "price": "3500",
    "busType": "ac",
    "numberOfSeat": "36",
    "passengers": [],
    "__v": 0
  },
  // Repeat the same pattern for other trip documents...
]);
```