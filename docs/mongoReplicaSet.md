### The problem
Transaction error: MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
codeName: 'IllegalOperation',

### What is a replica set?
A replica set in MongoDB is a group of MongoDB servers that maintain the same data set, providing data redundancy and high availability.

Replica sets are the basis for all production deployments in MongoDB. They ensure that your data is:
1. Highly Available: If one server goes down, another can take over.
2. Consistent: All members of the set maintain the same data.
3. Fault-Tolerant: Data remains accessible even if one or more servers fail.

A replica set typically consists of:
1. Primary Node: The main server that handles all write operations.
2. Secondary Nodes: Replicate data from the primary node and serve as backups. Can be configured to handle read operations.
3. Arbiter (optional): A lightweight server that helps to elect a new primary during failover. Does not store data.

### Example structure
+-------------------+      +------------------+      +-------------------+
|   Primary Node     | ---> |  Secondary Node   | ---> |   Arbiter Node     |
|  (Handles Writes)  |      | (Read-Only Backup)|      | (Vote in Elections)|
+-------------------+      +------------------+      +-------------------+

### How Replication Works:

1. Data Write:
All writes go to the primary node.
The primary node logs the changes in its oplog (operations log).

2. Data Propagation:
Secondary nodes replicate the primary’s oplog to apply changes.
This ensures eventual consistency across all nodes.

3. Failover:
If the primary node fails, one of the secondaries is promoted to primary using a voting process.
The new primary then starts handling all write operations.

### Why Use a Replica Set?

1. High Availability:
If the primary goes down, one of the secondaries is automatically elected as the new primary.

2. Data Redundancy:
Copies of your data exist on multiple servers, reducing the risk of data loss.

3. Automatic Failover:
In case of a server crash, the system automatically switches to another node.

4. Read Scalability:
You can configure reads from secondary nodes, which can help reduce the load on the primary.

5. Support for Transactions:
MongoDB transactions are only supported on replica sets because they require high consistency and rollback capabilities.

### Example: Single-Node Replica Set (for Development)

You can create a single-node replica set for development purposes by running the following command:
mongod --replSet rs0 --dbpath /data/db --port 27017

After starting the server, you can initialize the replica set by running the following command:
mongosh --port 27017
use woovi-playground
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "localhost:27017" }
    ]
})

Verify the replica set status:
mongosh --port 27017
use woovi-playground
rs.status()

### Example: Multi-Node Replica Set (for Production)

You can create a multi-node replica set for production purposes by running the following command:
mongod --replSet rs0 --dbpath /data/db1 --port 27017

Node 1: mongod --replSet rs0 --dbpath /data/db1 --port 27017
Node 2: mongod --replSet rs0 --dbpath /data/db2 --port 27018
Node 3: mongod --replSet rs0 --dbpath /data/db3 --port 27019

After starting the servers, you can initialize the replica set by running the following command:
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})

Verify the replica set status:
mongosh --port 27017
use woovi-playground
rs.status()

### Key Takeaways:
- A replica set ensures your data is durable, consistent, and highly available.
- It allows for automatic failover and read scaling.
- Transactions require a replica set because they guarantee atomicity, consistency, isolation, and durability (ACID).
- Even in development, you must run MongoDB as a single-node replica set if you plan to use transactions.

### Docker
docker-compose up -d

docker exec -it mongodb mongosh --port 27017
> rs.initiate()

### Dev/Local
mkdir -p ~/mongo-rs-data
mongod --replSet rs0 --port 27018 --dbpath ~/mongo-rs-data
nohup mongod --replSet rs0 --port 27018 --dbpath ~/mongo-rs-data > ~/mongo-rs.log 2>&1 &

mongosh --port 27018
> rs.initiate()