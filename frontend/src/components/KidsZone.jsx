import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/api';

const FOOD_CARDS = ['🍕', '🍔', '🍦', '🥭', '🍩', '🍟'];

export function KidsZone({ restaurantId, tableId }) {
  const [activeGame, setActiveGame] = useState('memory'); // 'memory' or 'tictactoe'

  // Memory Game State
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Tic Tac Toe State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);

  const initMemoryGame = () => {
    const deck = [...FOOD_CARDS, ...FOOD_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);

    trackEvent({
      restaurantId,
      tableId,
      eventType: 'game_play',
      eventData: { game: 'Memory Match', action: 'start' }
    });
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length === cards.length) {
          setGameWon(true);
          trackEvent({
            restaurantId,
            tableId,
            eventType: 'game_play',
            eventData: { game: 'Memory Match', action: 'win', moves: moves + 1 }
          });
        }
      } else {
        setTimeout(() => setFlipped([]), 850);
      }
    }
  };

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(Boolean)) return 'Tie';
    return null;
  };

  const handleSquareClick = (idx) => {
    if (board[idx] || winner) return;

    const newBoard = [...board];
    newBoard[idx] = '🍕';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
      return;
    }

    setTimeout(() => {
      const emptyIdxs = newBoard.map((val, i) => (val === null ? i : null)).filter((val) => val !== null);
      if (emptyIdxs.length > 0) {
        const randomPick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
        newBoard[randomPick] = '🤖';
        setBoard([...newBoard]);
        const finalWin = checkWinner(newBoard);
        if (finalWin) setWinner(finalWin);
      }
    }, 350);
  };

  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Mobile Fun Banner */}
      <div className="bg-linear-to-r from-purple-900 to-indigo-900 border border-purple-700/60 p-3.5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="text-lg">🎨</span>
            <h3 className="font-extrabold text-sm text-white">Kids Fun Zone</h3>
          </div>
          <p className="text-[11px] text-purple-200">Play games while waiting for food!</p>
        </div>

        <div className="flex bg-slate-950/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveGame('memory')}
            className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
              activeGame === 'memory' ? 'bg-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            Pairs
          </button>
          <button
            onClick={() => setActiveGame('tictactoe')}
            className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
              activeGame === 'tictactoe' ? 'bg-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            Tic-Tac
          </button>
        </div>
      </div>

      {/* Memory Game */}
      {activeGame === 'memory' && (
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300">Moves: <strong className="text-orange-400">{moves}</strong></span>
            <button
              onClick={initMemoryGame}
              className="flex items-center space-x-1 text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-800 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {gameWon ? (
            <div className="py-6 bg-purple-950/60 border border-purple-700 rounded-2xl p-4">
              <span className="text-4xl block mb-1">🎉</span>
              <h4 className="text-base font-black text-amber-300 mb-1">Super Chef Master!</h4>
              <p className="text-xs text-purple-200 mb-3">You matched all cards in {moves} moves!</p>
              <button
                onClick={initMemoryGame}
                className="py-2 px-5 rounded-xl font-bold bg-amber-500 text-slate-900 text-xs"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
              {cards.map((card, idx) => {
                const isFlipped = flipped.includes(idx) || matched.includes(idx);
                const isMatched = matched.includes(idx);

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`h-16 rounded-xl text-2xl flex items-center justify-center transition-all shadow-xs ${
                      isMatched
                        ? 'bg-emerald-950 border border-emerald-500 scale-95 opacity-70'
                        : isFlipped
                        ? 'bg-purple-900 border-2 border-purple-400 scale-100'
                        : 'bg-linear-to-b from-purple-600 to-indigo-700 text-white'
                    }`}
                  >
                    {isFlipped ? card.emoji : '❓'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tic-Tac-Toe */}
      {activeGame === 'tictactoe' && (
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300">You (🍕) vs Chef Bot (🤖)</span>
            <button
              onClick={resetTicTacToe}
              className="flex items-center space-x-1 text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-800 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {winner && (
            <div className="mb-3 py-1.5 px-3 rounded-xl bg-purple-900/90 text-purple-200 font-bold text-xs">
              {winner === 'Tie' ? "It's a Delicious Tie!" : winner === '🍕' ? '🏆 You Won!' : '🤖 Chef Bot won!'}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleSquareClick(idx)}
                className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 text-2xl font-bold flex items-center justify-center transition"
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
