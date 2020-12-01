import { useState } from 'react'
import { Redirect } from 'react-router-dom'

function HomePage() {

  const [newGameId, setNewGameId] = useState('')

  const createGame = () => {
    fetch('game/create', {
      method: 'POST',
    }).then((res) => {
      return res.json()
    }).then((json) => {
      if (json.status === 'success') {
        setNewGameId(json.data.id)
      } else if (json.status === 'error') {
        console.error(json.message)
      }
    }).catch(console.error.bind(console))
  }

  return (
    <div className="main-container">
      <div className="sub-container">
        <h1>Chess</h1>
        <p>
          Play Chess with your friends!
        </p>
        <button onClick={createGame}>Create Game</button>
      </div>
      {newGameId !== '' && <NewGame id={newGameId}/>}
    </div>
  );
}

function NewGame({ id }) {
  const [joinGame, setJoinGame] = useState(false)

	return (
    <div className="sub-container">
      <div className="m-1">
      Share this link with your opponent:&nbsp;
      <span className="copy-url">{process.env.REACT_APP_BASEURL + '/' + id}/</span>
      </div>
      <button onClick={() => setJoinGame(true)}>Join Game</button>
      {joinGame && <Redirect to={'/game/' + id} />}
    </div>
  )
}

export default HomePage