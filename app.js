const express = require('express')
const bodyparser = require('body-parser')
const { MongoClient } = require('mongodb')
const axios = require('axios').default;
const app = express()
const port = 5000
const DBUrl = "mongodb+srv://eldottorugo:jnodlLDUevTit4bc@cluster0.z7bax.mongodb.net/?retryWrites=true&w=majority"
const mongoClient = new MongoClient(DBUrl)
const DBName = "usersDB"
const weatherAPIUrl = "https://api.openweathermap.org/data/2.5/weather"
const weatherAPIKey = "793615f7609bcfaeb370a166d3a561da"



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


// Trovare un modo per passare un array di info delle citta in una sola botta e passarlo alla view altrimenti non funziona.
app.post('/login',bodyparser.urlencoded(), async function (req,res) {
    const userData = req.body
    const citiesInfo = []
    checkAuth(userData.email, userData.password).then(data => {
        if(data.length){
            getCities(userData.email).then(results => {
                for (var i=0;i<results.length;i++){
                    axios.get(weatherAPIUrl + '?q=' + results[i].city + "&appid=" + weatherAPIKey).then(function (response) {
                        citiesInfo.push(response.data.weather[0])
                    })
                }
                return ()=>{
                    res.render('album.ejs',{email: userData.email, cities: results, info: citiesInfo})
                }
            }).catch(error => {
                console.log(error)
            })
        }
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

checkAuth = async (email, password) => {
    try{
        await mongoClient.connect()
        const database = mongoClient.db(DBName)
        const users = database.collection('users')
        let result = await users.find(
            { email: email, password: password}
        ).toArray()
        return Promise.resolve(result)
    }catch (error) {
        return Promise.reject([])
    }
}

getCities = async (email) => {
    try{
        await mongoClient.connect()
        const database = mongoClient.db(DBName)
        const cities = database.collection('links')
        let results = await cities.find(
            { email: email}
        ).toArray()
        return Promise.resolve(results)
    }catch (error) {
        Promise.reject([])
    }
}