const express = require('express')
const bodyparser = require('body-parser')
const { MongoClient } = require('mongodb')
const app = express()
const port = 5000
const DBUrl = "mongodb+srv://eldottorugo:jnodlLDUevTit4bc@cluster0.z7bax.mongodb.net/?retryWrites=true&w=majority"
const mongoClient = new MongoClient(DBUrl)
const DBName = "usersDB"



app.use(express.static('./public/dist'))
app.use(express.static('./node_modules/bootstrap/dist'))
app.use(express.static('./node_modules/@popperjs/core/dist/umd'))
app.set('view engine','ejs')


app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.get('/login',(req,res)=>{
    res.render('login.ejs',{ error: ''})
})

app.get('/album',(req,res)=>{
    res.render('album.ejs')
})

app.post('/login',bodyparser.urlencoded(), async function (req,res) {
    const userData = req.body
    getData('users', userData.email, userData.password).then(data => {
        if(data.length)
            res.redirect('/album')
        else
            res.render('login.ejs',{ error: '!auth'})
    })
})

app.listen(port,()=>{
    console.log(`The server started on port ${port}`)
})

insertDB = async (collectionName, elementToInsert) => {
    try{
        await mongoClient.connect()
        const database = mongoClient.db(DBName)
        const users = database.collection(collectionName)
        let result = await users.insertOne(
            { 'email': elementToInsert.email, 'password': elementToInsert.password}
        )
        return Promise.resolve(result)
    }catch (error) {
        return Promise.reject()
    }
}

getData = async (collectionName, email, password) => {
    try{
        await mongoClient.connect()
        const database = mongoClient.db(DBName)
        const users = database.collection(collectionName)
        let result = await users.find(
            { email: email, password: password}
        ).toArray()
        return Promise.resolve(result)
    }catch (error) {
        return Promise.reject([])
    }
}