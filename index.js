const debug = require('debug')('server')

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const helmet = require('helmet')

// middleware
app.use(helmet())
app.use(express.static(__dirname + '/client/build'))

app.get('/api/hello', (req, res) => {
	res.send('hello from the API')
})



let games = []

const PAWN = 'pawn'
const KNIGHT = 'knight'
const BISHOP = 'bishop'
const ROOK = 'rook'
const QUEEN = 'queen'
const KING = 'king'
const WHITE = 'white'
const BLACK = 'black'

const piecePositions = {
	a: ROOK,
	b: KNIGHT,
	c: BISHOP,
	d: QUEEN,
	e: KING,
	f: BISHOP,
	g: KNIGHT,
	h: ROOK
}

app.post('/game/create', (req, res) => {
	const newGame = {
		id: games.length,
		squares: []
	}
	for (let i = 0; i < 64; i++) {
		const letter = 'abcdefgh'[i % 8]
		const number = Math.floor(i / 8) + 1
		const newSquare = {
			name: letter + number
		}
		if (number === 2) {
			newSquare.piece = {
				type: PAWN,
				player: WHITE
			}
		} else if (number === 7) {
			newSquare.piece = {
				type: PAWN,
				player: BLACK
			}
		} else if (number === 1) {
			newSquare.piece = {
				type: piecePositions[letter],
				player: WHITE
			}
		} else if (number === 8) {
			newSquare.piece = {
				type: piecePositions[letter],
				player: BLACK
			}
		}
		newGame.squares.push(newSquare)
	}

	games.push(newGame)

	debug('created game ' + newGame.id)
	res.status(201).json({ status: 'success', data: { id: newGame.id } })
})

io.on('connection', (socket) => {

	socket.on('join', (gameId) => {
		// make sure game exists
		if (!games[gameId]) {
			socket.emit('join failed', 'invalid game')
			return
		}

		// join game
		socket.join(gameId)
		const game = games[gameId]

		// set sides
		if (!game.white) {
			debug(socket.id + ' joined game ' + gameId + ' as white')
			game.white = socket.id
		} else if (!game.black) {
			debug(socket.id + ' joined game ' + gameId + ' as black')
			game.black = socket.id
		} else {
			socket.emit('join failed', 'room full')
		}

		// send game data
		socket.emit('game data', game)

		socket.on('disconnect', () => {
			debug('disconnected')
		})
	})
})

app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/client/build/index.html')
})

server.listen(process.env.PORT || 3001)
