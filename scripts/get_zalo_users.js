const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://dotnearcelo_db_user:yAA774bOAEX0ugM3@cluster0.v9o8un1.mongodb.net/muachungco?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('muachungco');
        const users = database.collection('users');
        const cursor = users.find({}, { projection: { _id: 0, name: 1, zaloId: 1 } });
        const allUsers = await cursor.toArray();
        console.table(allUsers);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
