import { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { id } = useParams()
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState()
	const [pieces, setPieces] = useState([{ type: 'pawn', player: 'white', square: 'a1' }])
	const [absPos, setAbsPos] = useState({ position: 'absolute', top: 0, left: 0 })
	const [draggedPiece, setDraggedPiece] = useState(null)

	// connect to game
	// useEffect(() => {
	// 	const socket = io()
	// 	socket.emit('join', id)

	// 	socket.on('join failed', (reason) => {
	// 		console.log('join failed: ' + reason)
	// 		setJoinFailed(true) // will cause redirect to home
	// 	})

	// 	socket.on('game data', (game) => {
	// 		if (game.white === socket.id) {
	// 			setSide('white')
	// 		} else if (game.black === socket.id) {
	// 			setSide('black')
	// 		}
	// 		setPieces(game.pieces)
	// 	})

	// 	return function cleanup() {
	// 		socket.disconnect()
	// 	}

	// }, [id])

	const trackMouse = (e) => {
		setAbsPos({
			position: 'absolute',
			pointerEvents: 'none',
			left: e.pageX - window.innerHeight / 16 + 'px',
			top: e.pageY - window.innerHeight / 16 + 'px'
		})
	}

	const startDrag = (e, square) => {
		setDraggedPiece(square.piece)
		trackMouse(e)
	}

	const endDrag = (e) => {
		if (draggedPiece) {
			// find the new square
			const square = squares.find((square) => {
				return square.id === document.elementFromPoint(e.clientX, e.clientY).id
			})

			// if square was found, place piece there
			if (square) {
				setPieces((pieces) => {
					const newPieces = pieces.slice()
					const index = newPieces.indexOf(draggedPiece)
					newPieces[index] = Object.assign(draggedPiece, { square: square.id })
					return newPieces
				})
			}

			setDraggedPiece(null)
		}
	}

	// set squares
	const squares = []
	for (let i = 0; i < 64; i++) {
		const square = {}
		const row = Math.floor(i / 8)
		const col = i % 8 
		square.id = (side === 'white') ? 'abcdefgh'[col] + (8 - row) : 'hgfedcba'[col] + (row + 1)
		square.piece = null

		// if there is a piece on this square add it
		pieces.forEach((piece) => {
			if (piece.square === square.id) {
				square.piece = piece
			}
		})
		squares.push(square)
	}

	return (
		<div onMouseMove={trackMouse} onMouseUp={endDrag}>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
			<div id="board">
				{squares.map((square) => {
					return (
						<div id={square.id} className="square" key={square.id}>
							{square.piece && draggedPiece !== square.piece &&
							<div className={'piece ' + square.piece.player + '-' + square.piece.type}
							onMouseDown={(e) => startDrag(e, square)}
							/>}
						</div>
					)
				})}
			</div>
			{draggedPiece &&
			<div className={'piece ' + draggedPiece.player + '-' + draggedPiece.type} style={absPos}/>}
		</div>
	)
}

export default GamePage