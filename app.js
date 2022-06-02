const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
require('dotenv').config()
const express = require('express')
const authMiddle = require('./authMiddle')
const bodyparser = require('body-parser')
const { MongoClient } = require('mongodb')
const axios = require('axios').default;
const app = express()
const port = 5000
const mongoClient = new MongoClient(process.env.DBUrlMaj)
const store = new MongoDBStore({
    uri: process.env.DBUrl + process.env.DBName,
    collection: 'sessions'
})

app.use(express.static('./public/dist'))
app.use(express.static('./node_modules/bootstrap/dist'))
app.use(express.static('./node_modules/@popperjs/core/dist/umd'))
app.set('view engine','ejs')


app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.use(session({
    secret: process.env.secretToken,
    resave: false,
    saveUninitialized: true,
    unset: 'destroy',
    store: store,
    name: 'sessionID',
    cookie: {secure:false,maxAge:3600000}
}))

app.get('/login',(req,res)=>{
    if(!req.session.user)
        res.render('login.ejs',{ error: ''})
    else
        res.redirect('/album')
})

app.post('/addCity',authMiddle,bodyparser.urlencoded(),async (req,res)=>{
    console.log(req.body);
    res.json('Bravo')
    res.end()
})

app.get('/album',authMiddle,(req,res)=>{
    const userEmail = req.session.user.email
    getCities(userEmail).then(results => {
        queryInfoAPI(results).then(citiesInfo => {
            queryPhotosAPI(results).then(photosCity => {
                res.render('album.ejs',{email: userEmail, cities: results, info: citiesInfo, photos: photosCity})
            })
        })
    }).catch(error => {
        console.log(error)
    })
})

app.post('/login',bodyparser.urlencoded(), async function (req,res) {
    const userData = req.body
    checkAuth(userData.email, userData.password).then(data => {
        if(data.length){
            req.session.user = {
                email: userData.email
            }
            res.redirect('/album')
        }else
            res.render('login.ejs',{ error: '!auth'})
    })
})

app.get('/logout',authMiddle, (req,res)=>{
    delete req.session.user
    res.redirect('/login')
})

app.listen(port,()=>{
    console.log(`The server started on port ${port}`)
})

queryInfoAPI = async (results) => {
    try{
        const citiesInfo = []
        for (var i=0;i<results.length;i++){
        let response = await axios.get(process.env.weatherAPIUrl + '?q=' + results[i].city + "&appid=" + process.env.weatherAPIKey + "&lang=it")
            citiesInfo.push(response.data)
        }
        return Promise.resolve(citiesInfo)
    }catch (error) {
        return Promise.reject()
    }
}

queryPhotosAPI = async (results) => {
    try{
        const photosInfo = []
        for (var i=0;i<results.length;i++){
            let response = await axios.get(process.env.placesAPIUrl + '?input=' + results[i].city + '&inputtype=textquery&language=it&fields=name,photos&key=' + process.env.placesAPIKey)
            let photo_reference = response.data.candidates[0].photos[0].photo_reference
            response = await axios.get( process.env.placesPhotosURL + '?photo_reference=' + photo_reference + '&maxwidth=300&maxheight=300&key=' + process.env.placesAPIKey,{ responseType: 'arraybuffer'})
            let image = Buffer.from(response.data, 'binary').toString('base64')
            photosInfo.push(image)
        }
        return Promise.resolve(photosInfo)
    }catch (error) {
        return Promise.reject()
    }
}

insertDB = async (collectionName, elementToInsert) => {
    try{
        await mongoClient.connect()
        const database = mongoClient.db(process.env.DBName)
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
        const database = mongoClient.db(process.env.DBName)
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
        const database = mongoClient.db(process.env.DBName)
        const cities = database.collection('links')
        let results = await cities.find(
            { email: email}
        ).toArray()
        return Promise.resolve(results)
    }catch (error) {
        Promise.reject([])
    }
}