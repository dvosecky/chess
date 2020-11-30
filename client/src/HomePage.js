import { useState } from 'react'

function HomePage() {

  const [newGameId, setNewGameId] = useState('')

  const createGame = () => {
    // fetch('game/create', {
    //   method: 'POST',
    // }).then((res) => {
    //   return res.json()
    // }).then((json) => {
    //   if (json.status === 'success') {
    //     setNewGameId(json.data.id)
    //   } else if (json.status === 'error') {
    //     console.error(json.message)
    //   }
    // }).catch(console.error.bind(console))
    setNewGameId('1234')
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

	return (
    <div className="sub-container">
      <div className="m-1">
      Share this link with your opponent:&nbsp;
      <span className="copy-url">{process.env.REACT_APP_BASEURL + '/' + id}/</span>
      </div>
      <button>Join Game</button>
    </div>
  )
}

export default HomePage