import { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { id } = useParams()
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState()
	const [pieces, setPieces] = useState([])
	const [absPos, setAbsPos] = useState({ position: 'absolute', top: 0, left: 0 })
	const [draggedPiece, setDraggedPiece] = useState(null)

	const squares = []

	// release dragged pieces if mouseup happens off of the board
	useEffect(() => {
		const endDrag = () => {
			setDraggedPiece(null)
		}
		document.addEventListener('mouseup', endDrag)
		return () => document.removeEventListener('mouseup', endDrag)
	}, [])

	// connect to game
	useEffect(() => {
		const socket = io()
		socket.emit('join', id)

		socket.on('join failed', (reason) => {
			console.log('join failed: ' + reason)
			setJoinFailed(true) // will cause redirect to home
		})

		socket.on('game data', (game) => {
			if (game.white === socket.id) {
				setSide('white')
			} else if (game.black === socket.id) {
				setSide('black')
			}
			setPieces(game.pieces)
		})

		return function cleanup() {
			socket.disconnect()
		}

	}, [id])

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

	const endDrag = (square => {
		if (draggedPiece) {
			setPieces((pieces) => {
				const newPieces = pieces.slice()
				const index = newPieces.indexOf(draggedPiece)
				newPieces[index] = Object.assign(draggedPiece, { square: square.name })
				return newPieces
			})
			setDraggedPiece(null)
		}
	})

	// initialize squares
	for (let i = 0; i < 8; i++) {
		squares.push([])
		for (let j = 0; j < 8; j++) {
			const square = {}
			square.name = (side === 'white') ? 'abcdefgh'[j] + (8 - i) : 'hgfedcba'[j] + (i + 1)
			square.piece = null

			// if there is a piece on this square add it
			pieces.forEach((piece) => {
				if (piece.square === square.name) {
					square.piece = piece
				}
			})
			squares[i].push(square)
		}
	}

	return (
		<div onMouseMove={trackMouse}>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
			{squares.map((row, rowNum) => {
				return (
					<div className="row" key={(rowNum + 1)}>{
						row.map((square) => {
							return (
								<div className="square" key={square.name} onMouseUp={() => endDrag(square)}>
									{square.piece && draggedPiece !== square.piece &&
									<div className={'piece ' + square.piece.player + '-' + square.piece.type}
										onMouseDown={(e) => startDrag(e, square)}
									/>}
								</div>
							)
						})
					}</div>
				)
			})}
			{draggedPiece &&
			<div className={'piece ' + draggedPiece.player + '-' + draggedPiece.type} style={absPos}/>}
		</div>
	)
}

export default GamePage