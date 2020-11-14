// express
const express = require('express')
const app = express()
app.listen(process.env.PORT || 3001)

const helmet = require('helmet')

// middleware
app.use(helmet())
app.use(express.static(__dirname + '/client/build'))

app.get('/api/hello', (req, res) => {
	res.send('hello from the API')
})

app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/client/build/index.html')
})