import { useParams } from "react-router-dom"

function GamePage() {
	const { id } = useParams()
	return (
		<div>
			<h1>This is game {id}</h1>
		</div>
	)
}

export default GamePage