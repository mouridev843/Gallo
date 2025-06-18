const gameboard = (function () {
  // État privé
  const board = ["", "", "", "", "", "", "", "", ""];

  // Méthodes publiques
  return {
    getBoard: () => [...board], // Copie pour immutabilité
    makeMove: (index, marker) => {
      if (board[index] === "") {
        board[index] = marker;
        return true;
      }
      return false;
    },
    resetBoard: () => {
      board.fill("");
    },
  };
})();

// Factory pour creer un player
function createPlayer(name, marker) {
  return {
    name,
    marker,
    getMarker() {
      return this.marker;
    },
    getName() {
      return this.name;
    },
  };
}

// Module pour game controller
const gameController = (function () {
  //Refference Prive
  let player1;
  let player2;
  let currentPlayer;
  let gameActive = true;
  // Initialiser les joueurs et le tableau de jeu
  return {
    init(player1Name, player2Name) {
      player1 = createPlayer(player1Name, "X");
      player2 = createPlayer(player2Name, "O");
      currentPlayer = player1;
      gameboard.resetBoard();
    },
    //changer le joueur courant
    switchPlayer() {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
    },
    // Jouer un tour et verifier si le coup est valide
    playRound(index) {
      if (!gameActive) return "Game is over";
      if (gameboard.makeMove(index, currentPlayer.getMarker())) {
        /* this.switchPlayer(); */
        return true;
      }
      return false;
    },
    // Obtenir le joueur courant
    getCurrentPlayer() {
      return currentPlayer;
    },
    // Obtenir le joueur 1
    getPlayer1() {
      return player1;
    },
    // Obtenir le joueur 2
    getPlayer2() {
      return player2;
    },
    // Obtenir la combinaison gagnante
    getWinningCombination() {
      const board = gameboard.getBoard(); // Correction ici
      const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // lignes
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // colonnes
        [0, 4, 8],
        [2, 4, 6], // diagonales
      ];
      // Vérifier les combinaisons gagnantes
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return combo;
        }
      }
      return null;
    },
    // Vérifier si un joueur a gagné
    checkWinner() {
      const winningCombo = this.getWinningCombination();
      if (winningCombo) {
        // Retourne le joueur qui a fait le dernier coup gagnant

        return currentPlayer;
      }
      return null;
    },
    // Vérifier si le tableau est plein
    isBoardFull() {
      return gameboard.getBoard().every((cell) => cell !== "");
    },
    // Vérifier si le jeu est actif
    isGameActive() {
      return gameActive;
    },
    // Définir l'état du jeu
    setGameActive(status) {
      gameActive = status;
    },
  };
})();

//Mettre à jour l'interface utilisateur
const displayController = (function () {
  const cells = document.querySelectorAll(".cell");
  const messageDiv = document.querySelector(".game-status");
  const restartBtn = document.getElementById("restartBtn");
  const player1Input = document.getElementById("player1");
  const player2Input = document.getElementById("player2");
  const updatePlayersBtn = document.getElementById("updatePlayersBtn");
  const player1ScoreDiv = document.getElementById("player1Score");
  const player2ScoreDiv = document.getElementById("player2Score");
  let player1Score = 0;
  let player2Score = 0;
  // Initialiser les scores
  const updateDisplay = () => {
    cells.forEach((cell, index) => {
      cell.textContent = gameboard.getBoard()[index];
    });
    messageDiv.textContent = `${gameController
      .getCurrentPlayer()
      .getName()}'s turn`;
    /* player1ScoreDiv.textContent = `Player 1 (${gameController
      .getPlayer1()
      .getName()}): ${player1Score}`;
    player2ScoreDiv.textContent = `Player 2 (${gameController
      .getPlayer2()
      .getName()}): ${player2Score}`; */
    player1ScoreDiv.querySelector(".score-value").textContent = player1Score;
    player2ScoreDiv.querySelector(".score-value").textContent = player2Score;
  };
  // Afficher le gagnant
  function showWinner(winner) {
    const winningCombo = gameController.getWinningCombination();
    if (winningCombo && Array.isArray(winningCombo)) {
      winningCombo.forEach((index) => {
        cells[index].classList.add("winning-cell");
      });
    }
    if (winner === gameController.getPlayer1()) {
      player1Score++;
    } else {
      player2Score++;
    }
    updateDisplay();
    messageDiv.textContent = `${winner.getName()} a gagné !`;
    gameController.setGameActive(false); // Mark game as inactive
  }
  // Afficher match nul

  function showDraw() {
    messageDiv.textContent = "Match nul !";
    gameController.setGameActive(false); // Mark game as inactive
  }
  // Gérer le clic sur une cellule
  function handleCellClick(e) {
    if (!gameController.isGameActive()) return; // Vérifier si le jeu est actif

    const index = parseInt(e.target.dataset.index);
    if (gameController.playRound(index)) {
      const winner = gameController.checkWinner();

      if (winner) {
        showWinner(winner);
      } else if (gameController.isBoardFull()) {
        showDraw();
      } else {
        gameController.switchPlayer();
        updateDisplay();
      }
    }
  }

  // Ajout des écouteurs d'événements aux cellules;
  cells.forEach((cell, index) => {
    cell.addEventListener("click", handleCellClick);
  });
  // Réinitialiser le jeu
  restartBtn.addEventListener("click", () => {
    gameboard.resetBoard();
    gameController.init(player1Input.value, player2Input.value);
    // Réinitialiser les styles du tableau
    cells.forEach((cell) => {
      cell.classList.remove("winning-cell");
      cell.textContent = "";
    });
    gameController.setGameActive(true); // Réactiver le jeu
    updateDisplay();
  });
  // Mettre à jour les noms des joueurs
  updatePlayersBtn.addEventListener("click", () => {
    gameController.init(player1Input.value, player2Input.value);
    player1Score = 0;
    player2Score = 0;

    updateDisplay();
  });
  // Initialisation du jeu
  gameController.init(
    player1Input.value || "Joueur 1",
    player2Input.value || "Joueur 2"
  );
  return {
    updateDisplay,
  };
})();
