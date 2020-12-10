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

const piecePositions = [
	ROOK,
	KNIGHT,
	BISHOP,
	QUEEN,
	KING,
	BISHOP,
	KNIGHT,
	ROOK
]

const columnLetters = 'abcdefgh'

// for development - delete me
createGame()

function createGame() {
	const newGame = {
		id: games.length
	}
	const pieces = []
	for (let i = 0; i < 8; i++) {
		pieces.push({
			type: PAWN,
			player: WHITE,
			square: columnLetters[i] + '2'
		})
		pieces.push({
			type: piecePositions[i],
			player: WHITE,
			square: columnLetters[i] + '1'
		})
		pieces.push({
			type: PAWN,
			player: BLACK,
			square: columnLetters[i] + '7'
		})
		pieces.push({
			type: piecePositions[i],
			player: BLACK,
			square: columnLetters[i] + '8'
		})
	}
	newGame.pieces = pieces

	games.push(newGame)

	debug('created game ' + newGame.id)
	return newGame.id
}

app.post('/game/create', (req, res) => {
	const gameId = createGame()
	res.status(201).json({ status: 'success', data: { id: gameId } })
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
			if (game.white === socket.id) {
				game.white = null
			} else if (game.black === socket.id) {
				game.black = null
			}
		})

		socket.on('move', (startSquare, endSquare) => {
			debug('moved')
			// find piece on startSquare, move it to endSquare, update the clients
			const piece = game.pieces.find((piece) => piece.square === startSquare)
			piece.square = endSquare
			io.in(gameId).emit('game data', game)
		})
	})
})

app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/client/build/index.html')
})

server.listen(process.env.PORT || 3001)
