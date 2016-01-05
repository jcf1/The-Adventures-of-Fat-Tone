Game.UIMode = {};

Game.UIMode.gameStart = {
  enter: function() {
      console.log("Game.UIMode.gameStart enter");
      Game.Message.sendMessage("Welcome to WSLR");
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gameStart handleInput");
    Game.switchUIMode(Game.UIMode.gamePlay);
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gameStart renderOnMain");
    display.clear();
    display.drawText(4,4,"Welcome to WSRL");
    display.drawText(4,6,"press any key to continue");
  }
};
Game.UIMode.gamePlay = {
  enter: function() {
      console.log("Game.UIMode.gameStart enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gameStart handleInput");
    if(eventType == 'keypress' && evt.keyCode == 13) {
        Game.switchUIMode(Game.UIMode.gameWin);
    } else if(eventType == 'keydown' && evt.keyCode == 27) {
      Game.switchUIMode(Game.UIMode.gameLose);
    }
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gameStart renderOnMain");
    display.clear();
    display.drawText(4,4,"Press [Enter] to win, [Esc] to lose");
  }
};
Game.UIMode.gameLose = {
  enter: function() {
      console.log("Game.UIMode.gameStart enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function() {
    console.log("Game.UIMode.gameStart handleInput");
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gameStart renderOnMain");
    display.clear();
    display.drawText(4,4,"You Lose");
  }
};
Game.UIMode.gameWin = {
  enter: function() {
      console.log("Game.UIMode.gameStart enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function() {
    console.log("Game.UIMode.gameStart handleInput");
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gameStart renderOnMain");
    display.clear();
    display.drawText(4,4,"You Win");
  }
};
