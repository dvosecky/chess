import './App.css';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import HomePage from './HomePage.js'
import GamePage from './GamePage.js'

function App() {

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/game/:gameId">
            <GamePage />
          </Route>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route path="*">
            <Redirect to="/"/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
