import { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { id } = useParams()
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState('black')
	// const [squares, setSquares] = useState(null)
	const [pieces, setPieces] = useState([{ square: 'a2', type: 'pawn', player: 'white' }])
	const [absPos, setAbsPos] = useState({ position: 'absolute', top: 0, left: 0 })
	const [draggedPiece, setDraggedPiece] = useState(null)

	const squares = []

	// initialize squares
	for (let i = 0; i < 8; i++) {
		squares.push([])
		for (let j = 0; j < 8; j++) {
			const name = (side === 'white') ? 'abcdefgh'[j] + (8 - i) : 'hgfedcba'[j] + (i + 1)
			squares[i].push({ piece: null, name })
		}
	}

	// add pieces to squares
	pieces.forEach((piece) => {
		squares.forEach((row) => {
			row.forEach((square) => {
				if (piece.square === square.name) {
					square.piece = piece
				}
			})
		})
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

	const updateAbsPos = (e) => {
		setAbsPos({
			position: 'absolute',
			pointerEvents: 'none',
			left: e.pageX - window.innerHeight / 16 + 'px',
			top: e.pageY - window.innerHeight / 16 + 'px'
		})
	}

	const dragPiece = (e, square) => {
		setDraggedPiece(square.piece)
		updateAbsPos(e)
		document.addEventListener('mousemove', updateAbsPos)
	}

	const dropPiece = (square => {
		if (draggedPiece) {
			console.log('up')
			setPieces((pieces) => {
				const newPieces = pieces.slice()
				const index = newPieces.indexOf(draggedPiece)
				console.log('index is ' , index)
				console.log('square.name is ', square.name)
				newPieces[index] = Object.assign(draggedPiece, { square: square.name })
				return newPieces
			})
			setDraggedPiece(null)
			document.removeEventListener('mousemove', updateAbsPos)
		} else {
			console.log(square.name)
		}
	})

	return (
		<div>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
			{squares.map((row, rowNum) => {
				return (
					<div className="row" key={(rowNum + 1)}>{
						row.map((square) => {
							return (
								<div className="square" key={square.name} onMouseUp={() => dropPiece(square)}>
									{square.piece && draggedPiece !== square.piece &&
									<div className={square.piece.player + '-' + square.piece.type}
										onMouseDown={(e) => dragPiece(e, square)}
									/>}
								</div>
							)
						})
					}</div>
				)
			})}
			{draggedPiece &&
			<div className={draggedPiece.player + '-' + draggedPiece.type} style={absPos}/>}
		</div>
	)
}

export default GamePage