import { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import io from 'socket.io-client'

function GamePage() {
	const { id } = useParams()
	const [joinFailed, setJoinFailed] = useState(false)
	const [side, setSide] = useState(null)

	useEffect(() => {
		const socket = io()
		socket.emit('join', id)

		socket.on('join failed', (reason) => {
			console.log('join failed: ' + reason)
			setJoinFailed(true)
		})

		socket.on('game data', (game) => {
			if (game.white === socket.id) {
				setSide('white')
			} else if (game.black === socket.id) {
				setSide('black')
			}
		})

	}, [id])

	return (
		<div>
			<h1>This is game {id}</h1>
			<h2>You are playing as {side}</h2>
			{joinFailed && <Redirect to="/"/>}
		</div>
	)
}

export default GamePage