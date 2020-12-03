import { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { id } = useParams()
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState('white')
	// const [squares, setSquares] = useState(null)
	const pieces = [{ square: 'a2', type: 'pawn', player: 'white' }]

	const squares = []

	// initialize squares
	for (let i = 0; i < 8; i++) {
		squares.push([])
		for (let j = 0; j < 8; j++) {
			squares[i].push(null)
		}
	}

	// add pieces to squares
	pieces.forEach((piece) => {
		let [letter, number] = piece.square.split('')
		number = parseInt(number)
		let col = letter.charCodeAt() - 'a'.charCodeAt()
		let row
		if (side === 'white') {
			row = 8 - number
			col = letter.charCodeAt() - 'a'.charCodeAt()
		} else if (side === 'black') {
			row = number - 1
			col = 7 - (letter.charCodeAt() - 'a'.charCodeAt())
		}
		squares[row][col] = { type: piece.type, player: piece.player }
	})
	


	// useEffect(() => {
	// 	const socket = io()
	// 	socket.emit('join', id)

	// 	socket.on('join failed', (reason) => {
	// 		console.log('join failed: ' + reason)
	// 		setJoinFailed(true)
	// 	})

	// 	socket.on('game data', (game) => {
	// 		if (game.white === socket.id) {
	// 			setSide('white')
	// 		} else if (game.black === socket.id) {
	// 			setSide('black')
	// 		}
	// 		setSquares(game.squares)
	// 	})

	// 	return function cleanup() {
	// 		socket.disconnect()
	// 	}

	// }, [id])

	return (
		<div>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
			{squares.map((row, rowNum) => {
				return (
					<div className="row" key={(rowNum + 1)}>{
						row.map((square, colNum) => {
							return (
								<div className="square" key={'abcdefgh'[colNum] + (rowNum + 1)}>
									{square && <div className={square.player + '-' + square.type} />}
								</div>
							)
						})
					}</div>
				)
			})}
		</div>
	)
}

export default GamePage