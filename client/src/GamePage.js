import { useEffect, useMemo, useRef, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { gameId } = useParams()
	const [socket, setSocket] = useState(null)
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState()
	const [pieces, setPieces] = useState([])
	const [absPos, setAbsPos] = useState({ position: 'absolute', top: 0, left: 0 })
	const [draggedPiece, setDraggedPiece] = useState(null)

	const squares = useMemo(() => {
		const squares = []
		for (let i = 0; i < 64; i++) {
			const square = {}
			// set square.id using algebraic notation
			const row = Math.floor(i / 8)
			const col = i % 8
			square.id = (side === 'white') ? 'abcdefgh'[col] + (8 - row) : 'hgfedcba'[col] + (row + 1)

			// if there is a piece on this square, add a reference to the piece object
			square.piece = null
			pieces.forEach((piece) => {
				if (piece.square === square.id) {
					square.piece = piece
				}
			})
			squares.push(square)
		}
		return squares
	}, [pieces, side])

	// initialize socket, connect to game
	useEffect(() => {
		const mySocket = io()
		mySocket.emit('join', gameId)
		
		mySocket.on('join failed', (reason) => {
			console.log('join failed: ' + reason)
			setJoinFailed(true) // will cause redirect to home
		})
		
		mySocket.on('game data', (game) => {
			if (game.white === mySocket.id) {
				setSide('white')
			} else if (game.black === mySocket.id) {
				setSide('black')
			}
			setPieces(game.pieces)
		})

		setSocket(mySocket)

		return function cleanup() {
			mySocket.disconnect()
		}

	}, [gameId])

	// using native DOM events to allow preventDefault() with TouchEvents (non-passive)
	// these events are for drag-and-dropping pieces
	const page = useRef()
	useEffect(() => {

		const trackPointer = (e) => {
			// update the absolute position styling applied to the dragged piece
			const offset = Math.min(window.innerWidth, window.innerHeight) / 16
			const x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX
			const y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY
			setAbsPos({
				position: 'absolute',
				left: x - offset + 'px',
				top: y - offset + 'px'
			})
		}
		
		const startDrag = (e) => {
			// find the square the pointer is over
			const pointerX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
			const pointerY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
			const elementId = document.elementFromPoint(pointerX, pointerY).id
			const square = squares.find((square) => square.id === elementId)
			if (square && square.piece) {
				// start dragging the piece on the square
				e.preventDefault()
				setDraggedPiece(square.piece)
				trackPointer(e)
			}
		}
		
		const endDrag = (e) => {
			if (draggedPiece) {
				// find the square the pointer is over
				e.preventDefault()
				const pointerX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
				const pointerY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
				const elementId = document.elementFromPoint(pointerX, pointerY).id
				const square = squares.find((square) => {
					return square.id === elementId
				})
				if (square && !square.piece) {
					// set the dropped piece's new square
					const previousSquare = draggedPiece.square
					setPieces((pieces) => {
						const newPieces = pieces.slice()
						const index = newPieces.indexOf(draggedPiece)
						newPieces[index] = Object.assign(draggedPiece, { square: square.id })
						return newPieces
					})
					// send the move to server
					socket.emit('move', previousSquare, square.id)
				}
				setDraggedPiece(null)
			}
		}
		
		const moveDrag = (e) => {
			if (draggedPiece) {
				e.preventDefault()
				trackPointer(e)
			}
		}

		const pageElement = page.current
		pageElement.addEventListener('touchmove', moveDrag, { passive: false })
		pageElement.addEventListener('mousemove', moveDrag)
		pageElement.addEventListener('touchstart', startDrag, { passive: false })
		pageElement.addEventListener('mousedown', startDrag)
		pageElement.addEventListener('touchend', endDrag, { passive: false })
		pageElement.addEventListener('mouseup', endDrag)

		return (() => {
			pageElement.removeEventListener('touchmove', moveDrag, { passive: false })
			pageElement.removeEventListener('mousemove', moveDrag)
			pageElement.removeEventListener('touchstart', startDrag, { passive: false })
			pageElement.removeEventListener('mousedown', startDrag)
			pageElement.removeEventListener('touchend', endDrag, { passive: false })
			pageElement.removeEventListener('mouseup', endDrag)
		})
	}, [squares, draggedPiece, socket])

	return (
		<div ref={page}>
			<h1>This is game {gameId}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}

			<div id="board">
				{squares.map((square) => {
					return (
						<div id={square.id} className="square" key={square.id}>
							{square.piece &&
							<div className={'piece ' + square.piece.player + '-' + square.piece.type}
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