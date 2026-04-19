import React, { Component } from 'react';
import './App.scss';
import Navbar from '../Navbar/Navbar';
import GameContainer from '../GameContainer/GameContainer';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import { removeHash } from '../../data/helperFuncs';

const options = {};

class App extends Component {
  state = {
    gameState: 'chooseCharacters',
    isDarkMode: JSON.parse(localStorage.getItem('darkMode')) || false
  };

  componentDidMount() {
    this.applyTheme(this.state.isDarkMode);
  }

  applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  toggleDarkMode = () => {
    const newMode = !this.state.isDarkMode;
    this.setState({ isDarkMode: newMode });
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    this.applyTheme(newMode);
  }

  startGame = () => {
    this.setState({gameState: 'game'});
  }

  endGame = () => {
    this.setState({gameState: 'chooseCharacters'});
  }

  componentWillUpdate(nextProps, nextState) {
    // This is primarily for demo site purposes. Hides #footer when game is on.
    if(document.getElementById('footer')) {
      if(nextState.gameState=='chooseCharacters')
        document.getElementById('footer').style.display = "block";
      else
        document.getElementById('footer').style.display = "none";
    }
  }

  componentWillMount() {
    if(document.getElementById('footer'))
      document.getElementById('footer').style.display = "block";
  }

  render() {
    return (
      <div>
        <Navbar
          gameState={this.state.gameState}
          handleEndGame={this.endGame}
        />
        <div className="outercontainer">
          <div className="container game">
            <GameContainer
              gameState={this.state.gameState}
              handleStartGame={this.startGame}
              handleEndGame={this.endGame}
            />
          </div>
        </div>
        <DarkModeToggle
          isDark={this.state.isDarkMode}
          onToggle={this.toggleDarkMode}
        />
      </div>
    )
  }
}

export default App;
