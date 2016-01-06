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
    Game.switchUIMode(Game.UIMode.gamePersistence);
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
    } else if(eventType == 'keypress' && evt.keyCode == 0) {
      Game.switchUIMode(Game.UIMode.gamePersistence);
    }
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gameStart renderOnMain");
    display.clear();
    display.drawText(1,3,"Press [Enter] to win, [Esc] to lose");
    display.drawText(1,4,"press = to save, load, or start a new game");
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
Game.UIMode.gamePersistence = {
  enter: function() {
      console.log("Game.UIMode.gamePersistence enter");
  },
  exit: function() {
    console.log("Game.UIMode.gamePersistence exit");
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gamePersistence handleInput");
    var inputChar = String.fromCharCode(evt.charCode)
    if(inputChar == 'S') {
      this.saveGame();
    } else if(inputChar == 'L') {
      this.loadGame();
    } else if (inputChar == 'N') {
      this.newGame();
    } else {
      Game.Message.sendMessage("CAPITALS MATTER");
    }
  },
  saveGame: function(json_state_data) {
    if (this.localStorageAvailable()) {
      window.localStorage.setItem(Game._persistenceNamespace, JSON.stringify(Game._game));
      console.log("post-save: using random seed "+Game.getRandomSeed());
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },
  loadGame: function() {
    if (this.localStorageAvailable()) {
      var json_state_data =  window.localStorage.getItem(Game._persistenceNamespace);
      var state_data = JSON.parse(json_state_data);
      console.dir(state_data);
      Game.setRandomSeed(state_data._randomSeed);
      console.log("post-restore: using random seed "+Game.getRandomSeed());
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },
  newGame: function() {
    Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform()*100000));
    Game.switchUIMode(Game.UIMode.gamePlay);
  },
  renderOnMain: function(display) {
    console.log("Game.UIMode.gamePersistence renderOnMain");
    display.clear();
    display.drawText(1,3,"press S to save the current game, L to load the saved game, or N to start a new game");
  },
  localStorageAvailable: function() {
    try {
      var x = '__storage_test__';
      window.localStorage.setItem(x,x);
      window.localStorage.removeItem(x);
      return true;
    }
    catch(e) {
      Game.Message.sendMessage('Sorry No Local Data Storage is Available For This Browser!');
      return false;
    }
  }
};
