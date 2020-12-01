const debug = require('debug')('server')

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

let games = []

app.post('/game/create', (req, res) => {
	const newGame = {
		id: games.length,
		squares: []
	}
	games.push(newGame)

	debug('created game ' + newGame.id)
	res.status(201).json({ status: 'success', data: { id: newGame.id } })
})

app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/client/build/index.html')
})