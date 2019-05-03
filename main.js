/*
 * Unbeatable Tic-Tac-Toe AI
 * Author: Cody Li           
 * Date: May 2nd 2019
 * Email: licody2000@gmail.com
 * Purpose: create an unbeatable Tic-Tac-Toe AI using jquery and minimax algorithm
 */
const SYMBOLS = {
  x:'X',
  o:'O'
}
const RESULT = {
  incomplete: 0,
  playerXWon: SYMBOLS.x,
  playerOWon: SYMBOLS.o,
  tie: 3
}
const MENU = {
  symbolSelect: 1,
  game: 2,
  result: 3
}
/*
Board object
*/
function Board (options){

  state = {
    view: MENU.symbolSelect,
    players: [
      {
        symbol: null,
        isComputer: false,
        score: 0
      },
      {
        symbol: null,
        isComputer: true,
        score: 0
      } 
    ]
  }
  /*
    init
  */
  function initGame(){
    state.game= {
      gameBoard: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ],
      turn: Math.round(Math.random()), // set randomly for first move
    }
  }
  /*
    returns how many moves have been made
  */
  function moveCount(board){
    let moveCount = 0
    for (let i = 0; i<board.length; i++){
      for (let j = 0; j<board[i].length; j++){
        if(board[i][j]!=""){
          moveCount++
        }
      }
    }
    return moveCount
  }
  /*
    returns an object with the result and array of winning boards
  */
  function getResult(board,symbol){
    let result = RESULT.incomplete;
    if (moveCount(board) < 5){
      return {result}
    }

    //checks if there are 3 symbols in a row
    function succession (line){
      return (line === symbol.repeat(3))
    }

    let line;
    let winningLine = []

    //check for winning rows
    for (var i = 0; i < 3; i++){
      line = board[i].join('')
      if(succession(line)){
        result = symbol
        winningLine = [[i,0],[i,1],[i,2]]
        return {result, winningLine}
      }
    }

    //check for winning columns
    for (var j = 0; j < 3; j++){
      let column = [board[0][j],board[1][j],board[2][j]];
      line = column.join('')
      if(succession(line)){
        result = symbol;
        winningLine = [[0,j],[1,j],[2,j]];
        return {result, winningLine};
      }
    }
    //check for winning diagonals
    let diag1 = [board[0][0],board[1][1],board[2][2]];
    line = diag1.join('');
    if(succession(line)){
      result = symbol;
      winningLine = [[0,0], [1,1], [2,2]];
      return {result, winningLine};
    }

    let diag2 = [board[0][2],board[1][1],board[2][0]];
    line = diag2.join('');
    if(succession(line)){
      result = symbol;
      winningLine = [[0,2], [1,1], [2,0]];
      return {result, winningLine};
    }

    //Checks for tie
    if (moveCount(board) == 9){
      result = RESULT.tie;
      return {result, winningLine}
    }

    return {result};
  }
  /*
    returns the coordinates and a score for that move(10 for win,0 for tie, -10 for losing)
  */
  function getBestMove(board, symbol){
    /*
      creates a duplicate array board 
    */
    function copyBoard(board) {
      let copy = []
      for (let row = 0; row < 3; row++){
        copy.push([])
        for (let column = 0; column < 3; column++){
          copy[row][column] = board[row][column];
        }
      }
      return copy
    }
    /*
      returns an array of available moves 
    */
    function getAvailableMoves (board) {
      let availableMoves = []
      for(let row = 0; row < 3; row++){
        for(let column = 0; column < 3; column++){
          if(board[row][column]===""){
            availableMoves.push({row, column})
          }
        }
      }
      return availableMoves
    }
    /*
      shuffles a given array in place
    */
    function shuffleArray (array){
      for (var i = array.length - 1; i > 0; i--){
        var rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand],array[i]]
      }
    }

    let availableMoves = getAvailableMoves(board)
    let availableMovesAndScores = []

    //Iterates over each possible move and returns winning moves immediately. 
    //Otherwise it pushes availbes moves and scores to the available Moves and Scores Array
    for (var i = 0; i < availableMoves.length ; i++){
      let move = availableMoves[i]
      let newBoard = copyBoard(board)
      newBoard = applyMove(newBoard, move, symbol)
      result = getResult(newBoard, symbol).result
      let score
      if (result == RESULT.tie) {score = 0}
      else if (result == symbol){
        score = 1
      }
      else {
        let otherSymbol = (symbol == SYMBOLS.x) ? SYMBOLS.o : SYMBOLS.x
        nextMove = getBestMove(newBoard, otherSymbol)
        score = - (nextMove.score)
      }

      if(score == 1)
        return {move, score}
      availableMovesAndScores.push({move, score})
    }

    shuffleArray(availableMovesAndScores)

    availableMovesAndScores.sort((moveA, moveB )=>{
        return moveB.score - moveA.score
      })
    return availableMovesAndScores[0]
  }
  /*
    render the screen according to board state
  */
  function render(){
    function getPlayerName(playerSymbol){
      if(playerSymbol === state.players[0].symbol)
        return "Player"
      return 'Computer'
    }

    function htmlButton(btnGroup, data, text){
      return `<button type = "button" class="btn btn-lg btn-default btnGroup${btnGroup}" data=${data}>${text}</button>`
    }

    function htmlSpaces (times){
      return '&emsp;'.repeat(times)
    }

    function htmlQ1(){
      const htm12 =`<div id ="q1"><h3>${!state.players[1].isComputer? "Player, <br />" : ""}Which symbol would you like to use?</h3> 
      ${htmlButton(1, "X", "X")} 
      ${htmlButton(1, "O", "O")}`
      return htm12
    }

    function htmlGame(){
      const moveNumber = moveCount(state.game.gameBoard) + 1
      const playerName = state.game.turn === 0 ? 'Player' : 'Computer'
      let htmlBefore = `<h3>move: ${moveNumber} ${htmlSpaces(5)} turn: ${playerName}</h3>`
      let board = state.game.gameBoard.reduce(function(acc,curr,rowIndex){
          return acc + `<div id= "row${rowIndex}" class="row">${curr.map((str,colIndex)=>`<div class="cell col${colIndex}" data-row=${rowIndex} data-column=${colIndex}>${str}</div>`).join('')}</div>`
        }, ``)
        let htmlAfter = `<h4>Score: ${htmlSpaces(1)} Player - ${state.players[0].score} ${htmlSpaces(2)} ${"Computer"} - ${state.players[1].score}</h4>`
      return `<div id='gameView'> ${htmlBefore} <div id="board">${board}</div> ${htmlAfter} </div>`
    }

    function htmlGameEnd (){
      function arraysAreEqual (arr1, arr2){
        if(arr1.length !== arr2.length)
          return false;
        for(var i = 0 ;arr1.length < i; i++) {
          if(arr1[i] !== arr2[i])
            return false;
        }
        return true;
      }

      let {result, winningLine} = getResult(state.game.gameBoard, state.players[state.game.turn].symbol )
      let resultText = "tie"
      if(result !== RESULT.tie)
        resultText = getPlayerName(result) + " Won"

      let htmlBefore = `<h3>${resultText} ${htmlSpaces(2)} Click to restart </h3> `
      let board = state.game.gameBoard.reduce(function(acc,curr,rowIndex){
        return acc + `<div id="row${rowIndex}" class="row">${curr.map(
          (str,colIndex)=>
          `<div class="cell col${colIndex} ${winningLine.some(arr=>(arraysAreEqual(arr,[rowIndex,colIndex]))) ? "winningLine" : ""}"
            data-row=${rowIndex} data-column=${colIndex}>${str}</div>`).join('')}</div>`
        }, ``)
        let htmlAfter = `<h4>Score: ${htmlSpaces(1)} Player - ${state.players[0].score} ${htmlSpaces(2)} ${"Computer"} - ${state.players[1].score}</h4>`
      return `<div id='resultView'> ${htmlBefore} <div id="board">${board}</id> ${htmlAfter} </div>`
    }

    let html = ''
    if (state.view == MENU.symbolSelect) {html = htmlQ1()}
    else if (state.view == MENU.result) {html = htmlGameEnd()}
    else {html=htmlGame()}
    options.el.innerHTML = html
  }

  function questionHandler (ev){
    let player1Symbol = $(ev.currentTarget).attr('data')
    state.players[0].symbol = player1Symbol;
    state.players[1].symbol = (player1Symbol === SYMBOLS.x) ? SYMBOLS.o: SYMBOLS.x;
    
    state.view = MENU.game;
    initGame();
    if(state.players[state.game.turn].isComputer)
      doComputerMove()
       
    render();
  }

  function doComputerMove (){
    let symbol = state.players[1].symbol;
    let move = getBestMove(state.game.gameBoard, symbol).move
    executeTurn(state.game.gameBoard, move, symbol);
  }

  function playerMoveHandler (ev){
    let symbol = state.players[state.game.turn].symbol
    let row = parseInt($(ev.currentTarget).attr('data-row'))
    let column = parseInt($(ev.currentTarget).attr('data-column'))
    executeTurn(state.game.gameBoard, {row, column}, symbol)
  }

  function applyMove(board,move, symbol) {
    board[move.row][move.column]= symbol
    return board
  }
    
  function executeTurn(board, move, symbol) {
    if (board[move.row][move.column]!==""){
      return board
    }
    
    applyMove(board, move, symbol)
    let result = getResult(board, symbol).result
    
    if (result === RESULT.incomplete){
      state.game.turn = (state.game.turn + 1)%2
      render()
    } 
    else {
      //Increment score and show result
      if(result !== RESULT.tie) {
        let winningPlayer = state.players.find((player)=>{return player.symbol == result})
        winningPlayer.score++
      }
        
      state.view = MENU.result
      render()
    }
    if (result==RESULT.incomplete && state.players[state.game.turn].isComputer){
      doComputerMove()
    }
  }
    
  function beginGame(){
    initGame()
    state.view = MENU.game
    render()
    if(state.game.turn === 1)
      doComputerMove();
  }
    
  $(options.el).on('click', '.btnGroup1', questionHandler)
  $(options.el).on('click', '#gameView .cell', playerMoveHandler)
  $(options.el).on('click', '#resultView', beginGame)
    
  render()
}
    
    
const board = new Board ({
  el : document.getElementById('root')
})
