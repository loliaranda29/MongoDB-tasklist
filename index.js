const express = require('express');
const app = express();
const { MongoClient} = require('mongodb');
const port = 8080;
const mongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://loliaranda37:Agus1503@cluster0.azmjdh2.mongodb.net/?retryWrites=true&w=majority";

const client = new mongoClient(url);

app.get('/', async (req, res) =>{
    try {
        await client.connect();
        const db = client.db('TaskList');
        const userCollection = db.collection('User');
        const taskCollection = db.collection('Task');
        
        const userDocuments = await userCollection.find().toArray();
    
        const taskDocuments = await taskCollection.find().toArray();
        
        client.close();
        
        res.json({
            user: userDocuments,
            task: taskDocuments
        });
    } catch (error) {
        console.log('Ocurrió un error en tu conexión', error);
        res.status(500).send("Error interno en el servidor");
    }
})

app.post('/NewDocument', async (req, res) =>{
    const newUser = {
        name: "Agus",
        age: "16",
    }
    const newTask = {
        name: "Realizar pedido de compras",
        state: false,  
    }
    try {
        await client.connect();
        const db = client.db('TaskList');

        const userCollection = db.collection('User');
        const userDocument = await userCollection.insertOne(newUser);

        const taskCollection = db.collection('Task');
        const taskDocument = await taskCollection.insertOne(newTask);

        client.close();

        res.json({
            user: userDocument,
            task: taskDocument
        });
    } catch (error) {
        console.log('Ocurrió un error en tu conexión', error);
        res.status(500).send("Error interno en el servidor");
    }
})

app.delete('/:id', async (req, res) =>{
    try {
        const documentID = req.params.id;
        const objectID = new ObjectID(documentID);
        await client.connect();
        const db = client.db('TaskList');

        const userCollection = db.collection('User');
        const userDeleteResult = await userCollection.deleteOne({ _id: objectID });

        const taskCollection = db.collection('Task');
        const taskDeleteResult = await taskCollection.deleteOne({ _id: objectID });

        client.close(); 
        if (userDeleteResult.deletedCount === 1 || taskDeleteResult.deletedCount === 1) {
            res.send("Documento eliminado con éxito de al menos una colección.");
        } else {
            res.send("El documento no se encontró en ninguna de las colecciones.");
        }
    } catch (error) {
        console.log('Ocurrió un error en tu conexión', error);
        res.status(500).send("Error interno en el servidor");
    }
})

app.post('/Update', async (req, res) => {
    const updatedUserData = {
        name:   "Elsa Capuntas",
        age: "26", 
    }

    const updatedTaskData = {
        name: "Pagar factura",
        state: true,
    };

    try {
        await client.connect();
        const db = client.db('TaskList');
        const userCollection = db.collection('User');
        const taskCollection = db.collection('Task');
        
        const userFilter = { name: "Patricia Aranda" }; 
        const taskFilter = { taskName: "Pagar factura" };

        const userUpdateResult = await userCollection.updateOne(userFilter, { $set: updatedUserData }, { session });
        const taskUpdateResult = await taskCollection.updateOne(taskFilter, { $set: updatedTaskData }, { session });
        
        client.close(); 
        
        if (userUpdateResult.modifiedCount === 1 && taskUpdateResult.modifiedCount === 1) {
            await session.commitTransaction();
            session.endSession();
            res.send("Usuario y tarea actualizados con éxito.");
        } else {
            await session.abortTransaction();
            session.endSession();
            res.send("El usuario o la tarea no se encontraron o no se actualizaron.");
        }
    } catch (error) {
        console.log('Ocurrió un error en tu conexión', error);
        res.status(500).send("Ocurrió un error en el servidor");
    } finally {
        session.endSession();
    }
})


app.listen(port,() => {
    console.log("Servidor corriendo en puerto", port)})