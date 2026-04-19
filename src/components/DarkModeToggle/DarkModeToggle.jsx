import React, { Component } from 'react';
import './DarkModeToggle.scss';

class DarkModeToggle extends Component {
  render() {
    return (
      <button
        id="dark-mode-toggle"
        className={'dark-mode-btn' + (this.props.isDark ? ' dark' : '')}
        onClick={this.props.onToggle}
        title={this.props.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle dark mode"
      >
        <span className="toggle-icon">
          {this.props.isDark ? '☀️' : '🌙'}
        </span>
      </button>
    );
  }
}

export default DarkModeToggle;
