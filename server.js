const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

// variables for connecting to the DataBase
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

    // connecting to MongoDB
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
    
    // setting the view engine and middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// rednder the home page
app.get('/', async (request, response, next)=>{
    try{
        const cartItems = await db.collection('cart').find().toArray()
        const itemsLeft = await db.collection('cart').countDocuments({completed: false})
        response.render('index.ejs', { items: cartItems, left: itemsLeft })
     
    }   catch(error){
        next(error)
    }
});

// add new item to the database using a form
app.post('/addItem', async (request, response,next) => {
    try{
    const result = await db.collection('cart').insertOne({thing: request.body.cartItem, completed: false})
    console.log(result);
    response.redirect('/')
    } 
    catch(error){
        next(error)
    }
});
// mark completing when item is completed
app.put('/markComplete', async(request, response,next) => {
    try{
      const result = await db.collection('cart').updateOne(
        {thing: request.body.itemFromJS},
        {$set: { completed: true } },
        { sort: {_id: -1}, upsert: false}
        );
        console.log('Marked Complete');
        response.json('Marked Complete');
        }
        catch(error){
        next(error)
    }

});

// mark incomplete when item is not completed
app.put('/markUnComplete', async(request, response, next) => {
    
    try{
   
       const result = await db.collection('cart').updateOne(
        {thing: request.body.itemFromJS},
        { $set: { completed: false } },
        { sort: {_id: -1}, upsert: false}
        
        );
        console.log('Marked Complete')
        response.json('Marked Complete')
    }
    catch(error){
    next(error)
    }
});

// delte item from database
app.delete('/deleteItem', async (request, response, next) => {
    
    try{
        const result = await db
        .collection('cart')
        .deleteOne({thing: request.body.itemFromJS})
        console.log('Cart item Deleted')
        response.json('Cart Item Deleted')
    } catch(error){
    next(error)
    }
});
// adding an error handling middleware to the express
app.use((err, request, response, next) => {
    console.error(err);
    response.status(500).send("Internal Server Error")
});

// start the server
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})