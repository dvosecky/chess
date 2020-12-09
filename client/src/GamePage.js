import { useEffect, useRef, useState } from 'react'
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



	const startDrag = (e, square) => {
		setDraggedPiece(square.piece)
		trackMouse(e)
	}

	const endDrag = (e) => {
		if (draggedPiece) {
			// find the new square
			const square = squares.find((square) => {
				return square.id === document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY).id
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

	const page = useRef()

	const trackMouse = (e) => {
		const offset = Math.min(window.innerWidth, window.innerHeight) / 16
		setAbsPos({
			position: 'absolute',
			pointerEvents: 'none',
			left: e.changedTouches[0].pageX - offset + 'px',
			top: e.changedTouches[0].pageY - offset + 'px'
		})
	}

	useEffect(() => {
		const touchMove = (e) => {
			if (draggedPiece) {
				e.preventDefault()
				trackMouse(e)
			}
		}

		const pageElement = page.current
		pageElement.addEventListener('touchmove', touchMove, { passive: false })
		return (() => {
			pageElement.removeEventListener('touchmove', touchMove, { passive: false })
		})
	}, [draggedPiece])

	return (
		<div
			ref={page}
			onTouchEnd={endDrag}
		>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
			<div id="board" draggable="false">
				{squares.map((square) => {
					return (
						<div id={square.id} className="square" key={square.id} draggable="false">
							{square.piece &&
							<div className={'piece ' + square.piece.player + '-' + square.piece.type}
								onTouchStart={(e) => startDrag(e, square)}
								style={draggedPiece === square.piece ? absPos : {}}
							/>}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default GamePage