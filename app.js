const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));

require('dotenv').config()
const port = 2000
const ttsRoutes = require('./routes/ttsRoutes')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(ttsRoutes)

app.listen(port,()=>{
    console.log(`app is running on the port ${port}`)
})
