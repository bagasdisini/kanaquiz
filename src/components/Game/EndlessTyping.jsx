import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import { findRomajisAtKanaKey, shuffle, arrayContains } from '../../data/helperFuncs';
import './EndlessTyping.scss';

class EndlessTyping extends Component {
  constructor(props) {
    super(props);

    this.askableKanaKeys = [];
    this.initializeKanaKeys();

    const row1 = this.generateRow();
    const row2 = this.generateRow();

    this.state = {
      rows: [row1, row2],
      currentRowIndex: 0,
      currentCharIndex: 0,
      inputBuffer: '',
      correctCount: 0,
      wrongCount: 0,
      isScrolling: false
    };
  }

  initializeKanaKeys() {
    this.askableKanaKeys = [];
    Object.keys(kanaDictionary).forEach(whichKana => {
      Object.keys(kanaDictionary[whichKana]).forEach(groupName => {
        if (arrayContains(groupName, this.props.decidedGroups)) {
          Object.keys(kanaDictionary[whichKana][groupName]['characters']).forEach(key => {
            this.askableKanaKeys.push(key);
          });
        }
      });
    });
  }

  generateRow() {
    const row = [];
    const keys = this.askableKanaKeys.slice();
    shuffle(keys);
    for (let i = 0; i < 10; i++) {
      const kanaKey = keys[i % keys.length];
      const romajis = findRomajisAtKanaKey(kanaKey, kanaDictionary);
      row.push({
        kana: kanaKey,
        romajis: romajis,
        status: 'pending',
        answered: ''
      });
    }
    return row;
  }

  componentDidMount() {
    // Focus the container to capture key events
    if (this.containerRef) {
      this.containerRef.focus();
    }
  }

  componentDidUpdate() {
    // Keep focus on container
    if (this.containerRef && document.activeElement !== this.containerRef) {
      this.containerRef.focus();
    }
  }

  handleKeyDown = (e) => {
    if (this.state.isScrolling) return;

    const key = e.key.toLowerCase();

    // Only process letter keys
    if (key.length !== 1 || !/[a-z]/.test(key)) return;

    e.preventDefault();

    const { rows, currentRowIndex, currentCharIndex, inputBuffer } = this.state;
    const currentCell = rows[currentRowIndex][currentCharIndex];
    const newBuffer = inputBuffer + key;

    // Check if exact match with any accepted romaji
    const isExactMatch = currentCell.romajis.some(r => r === newBuffer);

    if (isExactMatch) {
      this.markCharacter('correct', newBuffer);
      return;
    }

    // Check if it's a valid prefix of any accepted romaji
    const isPrefix = currentCell.romajis.some(r => r.startsWith(newBuffer));

    if (isPrefix) {
      // Keep accumulating
      this.setState({ inputBuffer: newBuffer });
      return;
    }

    // No match — wrong answer
    this.markCharacter('wrong', newBuffer);
  }

  markCharacter(status, answered) {
    const { rows, currentRowIndex, currentCharIndex, correctCount, wrongCount } = this.state;
    const newRows = rows.map(row => row.map(cell => ({ ...cell })));

    newRows[currentRowIndex][currentCharIndex].status = status;
    newRows[currentRowIndex][currentCharIndex].answered = answered;

    const newCorrect = status === 'correct' ? correctCount + 1 : correctCount;
    const newWrong = status === 'wrong' ? wrongCount + 1 : wrongCount;

    const nextCharIndex = currentCharIndex + 1;

    if (nextCharIndex >= 10) {
      // Row complete — trigger scroll animation
      this.setState({
        rows: newRows,
        correctCount: newCorrect,
        wrongCount: newWrong,
        inputBuffer: '',
        isScrolling: true
      }, () => {
        // Small delay before starting animation so the last character's color shows
        setTimeout(() => {
          this.startScrollAnimation();
        }, 300);
      });
    } else {
      this.setState({
        rows: newRows,
        currentCharIndex: nextCharIndex,
        correctCount: newCorrect,
        wrongCount: newWrong,
        inputBuffer: ''
      });
    }
  }

  startScrollAnimation() {
    if (this.sliderRef) {
      this.sliderRef.classList.add('scroll-up');
      const rowHeight = this.sliderRef.firstChild ? this.sliderRef.firstChild.offsetHeight : 100;
      this.sliderRef.style.transform = `translateY(-${rowHeight}px)`;
    }
  }

  handleTransitionEnd = () => {
    const { rows, currentRowIndex } = this.state;

    // Remove the completed row (top), add a new row at the bottom
    const newRows = rows.slice(1);
    newRows.push(this.generateRow());

    // Reset the slider position without animation
    if (this.sliderRef) {
      this.sliderRef.classList.remove('scroll-up');
      this.sliderRef.style.transform = 'translateY(0)';
    }

    this.setState({
      rows: newRows,
      currentCharIndex: 0,
      isScrolling: false
    });
  }

  render() {
    const { rows, currentRowIndex, currentCharIndex, inputBuffer, correctCount, wrongCount, isScrolling } = this.state;
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;

    return (
      <div
        className="endless-typing"
        tabIndex="0"
        ref={el => this.containerRef = el}
        onKeyDown={this.handleKeyDown}
      >
        <div className="endless-stats">
          <div className="stat stat-correct">
            Correct: <span className="stat-value">{correctCount}</span>
          </div>
          <div className="stat stat-wrong">
            Wrong: <span className="stat-value">{wrongCount}</span>
          </div>
          <div className="stat stat-accuracy">
            Accuracy: <span className="stat-value">{accuracy}%</span>
          </div>
        </div>

        <div className="rows-viewport">
          <div
            className="rows-slider"
            ref={el => this.sliderRef = el}
            onTransitionEnd={this.handleTransitionEnd}
          >
            {rows.map((row, rowIdx) => (
              <div className="kana-row" key={`row-${rowIdx}-${row.map(c => c.kana).join('')}`}>
                {row.map((cell, cellIdx) => {
                  let cellClass = 'kana-cell';

                  if (cell.status === 'correct') cellClass += ' cell-correct';
                  else if (cell.status === 'wrong') cellClass += ' cell-wrong';
                  else if (rowIdx === currentRowIndex && cellIdx === currentCharIndex && !isScrolling)
                    cellClass += ' cell-active';
                  else cellClass += ' cell-pending';

                  return (
                    <div className={cellClass} key={cellIdx}>
                      <span className="kana-char">{cell.kana}</span>
                      <span className="romaji-label">
                        {cell.status !== 'pending' ? cell.romajis[0] : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="input-buffer-display">
          <span className="buffer-text">{inputBuffer || '\u00A0'}</span>
          <span className="buffer-hint">Type the romaji for each character</span>
        </div>
      </div>
    );
  }
}

export default EndlessTyping;
