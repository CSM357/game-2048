import { useState, useEffect, useCallback } from "react";

const Game2048 = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initializeBoard = useCallback((size) => {
    const newBoard = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));
    const board1 = addNewTile(newBoard, size);
    const board2 = addNewTile(board1, size);
    return board2;
  }, []);

  const addNewTile = (currentBoard, size) => {
    const emptyPositions = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentBoard[i][j] === 0) {
          emptyPositions.push([i, j]);
        }
      }
    }

    if (emptyPositions.length === 0) return currentBoard;

    const [row, col] =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const newTile = Math.random() < 0.9 ? 2 : 4;
    const newBoard = currentBoard.map((r) => [...r]);
    newBoard[row][col] = newTile;
    return newBoard;
  };

  const canMove = useCallback((currentBoard, size) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const current = currentBoard[i][j];
        if (current === 0) return true;
        if (i < size - 1 && current === currentBoard[i + 1][j]) return true;
        if (j < size - 1 && current === currentBoard[i][j + 1]) return true;
      }
    }
    return false;
  }, []);

  const mergeLine = (line) => {
    let result = line.filter((val) => val !== 0);
    let mergeScore = 0;

    for (let i = 0; i < result.length - 1; i++) {
      if (result[i] === result[i + 1]) {
        result[i] *= 2;
        mergeScore += result[i];
        result.splice(i + 1, 1);
      }
    }

    while (result.length < line.length) {
      result.push(0);
    }

    return { merged: result, score: mergeScore };
  };

  const move = useCallback((currentBoard, direction, size) => {
    let newBoard = currentBoard.map((r) => [...r]);
    let moveScore = 0;
    let moved = false;

    if (direction === "LEFT" || direction === "RIGHT") {
      for (let i = 0; i < size; i++) {
        const line = direction === "LEFT" ? newBoard[i] : newBoard[i].reverse();
        const { merged, score } = mergeLine(line);
        newBoard[i] = direction === "LEFT" ? merged : merged.reverse();
        moveScore += score;
        if (JSON.stringify(currentBoard[i]) !== JSON.stringify(newBoard[i]))
          moved = true;
      }
    } else {
      for (let j = 0; j < size; j++) {
        const line =
          direction === "UP"
            ? newBoard.map((r) => r[j])
            : newBoard.map((r) => r[j]).reverse();
        const { merged, score } = mergeLine(line);

        for (let i = 0; i < size; i++) {
          if (direction === "UP") {
            newBoard[i][j] = merged[i];
          } else {
            newBoard[size - 1 - i][j] = merged[i];
          }
        }
        moveScore += score;
      }
      moved = !newBoard.every((row, i) =>
        row.every((val, j) => val === currentBoard[i][j])
      );
    }

    if (!moved) return { board: currentBoard, score: 0, moved: false };

    const updatedBoard = addNewTile(newBoard, size);
    return { board: updatedBoard, score: moveScore, moved: true };
  }, []);

  useEffect(() => {
    const newBoard = initializeBoard(boardSize);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [boardSize, initializeBoard]);

  useEffect(() => {
    if (gameOver || won) return;

    const handleKeyPress = (e) => {
      const keyMap = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };

      const direction = keyMap[e.key];
      if (!direction) return;

      e.preventDefault();
      const {
        board: newBoard,
        score: moveScore,
        moved,
      } = move(board, direction, boardSize);

      if (moved) {
        setBoard(newBoard);
        setScore((prev) => prev + moveScore);

        const hasWon = newBoard.some((row) => row.some((val) => val === 2048));
        if (hasWon && !won) setWon(true);

        if (!canMove(newBoard, boardSize)) {
          setGameOver(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [board, move, canMove, gameOver, won, boardSize]);

  const getTileColor = (value) => {
    const colors = {
      0: "#f0ebe5",
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#3c3c2f";
  };

  const getTileTextColor = (value) => {
    return value > 4 ? "#f9f6f2" : "#776e65";
  };

  const handleBoardSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 3 && size <= 8) {
      setBoardSize(size);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes popIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .game-container {
          animation: slideIn 0.6s ease-out;
        }
        
        .tile {
          animation: popIn 0.2s ease-out;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .win-animation {
          animation: pulse 0.5s ease-in-out;
        }
      `}</style>

      <div
        className="game-container"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          padding: "40px 35px",
          maxWidth: "480px",
          width: "100%",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "800",
                margin: "0 0 5px 0",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              2048
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#999",
                letterSpacing: "1px",
              }}
            >
              MERGE & WIN
            </p>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              padding: "15px 20px",
              borderRadius: "12px",
              textAlign: "center",
              color: "white",
            }}
          >
            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.9 }}>
              SCORE
            </p>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "800" }}>
              {score}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#666",
                whiteSpace: "nowrap",
              }}
            >
              BOARD SIZE:
            </label>
            <select
              value={boardSize}
              onChange={handleBoardSizeChange}
              style={{
                padding: "8px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                background: "#f5f5f5",
                color: "#333",
                transition: "all 0.3s",
                flex: 1,
              }}
            >
              {[3, 4, 5, 6].map((size) => (
                <option key={size} value={size}>
                  {size}×{size}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              const newBoard = initializeBoard(boardSize);
              setBoard(newBoard);
              setScore(0);
              setGameOver(false);
              setWon(false);
            }}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 16px rgba(102, 126, 234, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            New Game
          </button>
        </div>

        {/* Game Board */}
        <div
          style={{
            background: "#bbada0",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              gap: "10px",
            }}
          >
            {board.map((row, i) =>
              row.map((value, j) => (
                <div
                  key={`${i}-${j}`}
                  className="tile"
                  style={{
                    background: getTileColor(value),
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize:
                      value > 999 ? "24px" : value > 99 ? "28px" : "32px",
                    fontWeight: "800",
                    color: getTileTextColor(value),
                    transition: "all 0.15s",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    userSelect: "none",
                  }}
                >
                  {value > 0 ? value : ""}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Messages */}
        {won && (
          <div
            className="win-animation"
            style={{
              marginBottom: "15px",
              padding: "18px",
              background: "linear-gradient(135deg, #84fab0, #8fd3f4)",
              border: "none",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#2d5016",
                fontWeight: "800",
                margin: 0,
                fontSize: "16px",
                letterSpacing: "1px",
              }}
            >
              🎉 YOU WON! 🎉
            </p>
            <p
              style={{
                color: "#2d5016",
                margin: "5px 0 0 0",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              Congratulations! You reached 2048!
            </p>
          </div>
        )}

        {gameOver && (
          <div
            style={{
              marginBottom: "15px",
              padding: "18px",
              background: "linear-gradient(135deg, #fa709a, #fee140)",
              border: "none",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#5a0000",
                fontWeight: "800",
                margin: 0,
                fontSize: "16px",
                letterSpacing: "1px",
              }}
            >
              GAME OVER
            </p>
            <p
              style={{
                color: "#5a0000",
                margin: "5px 0 0 0",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              Final Score: {score}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div
          style={{
            background: "#f8f7f6",
            padding: "18px",
            borderRadius: "12px",
            textAlign: "center",
            borderLeft: "4px solid #667eea",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "11px",
              fontWeight: "700",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            How to Play
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "#999",
              lineHeight: "1.6",
            }}
          >
            ⬆️ ⬇️ ⬅️ ➡️ or W A S D to move
            <br />
            Merge tiles to reach <strong>2048!</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
