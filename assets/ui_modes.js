Game.UIMode = {};

Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function() {
    console.log("Game.UIMode.gameStart enter");
    Game.Message.sendMessage("Welcome to WSLR");
    Game.refresh();
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gameStart handleInput");
    if(evt.charCode !== 0) {
      Game.switchUIMode(Game.UIMode.gamePersistence);
    }
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gameStart renderOnMain");
    display.drawText(4,4,"Welcome to WSRL",fg,bg);
    display.drawText(4,6,"press any key to continue",fg,bg);
  }
};
Game.UIMode.gamePlay = {
  attr: {
    _map:null,
    _mapWidth: 300,
    _mapHeight: 200,
    _cameraX: 100,
    _cameraY: 100,
    _avatarX: 100,
    _avatarY: 100
  },
  JSON_KEY: 'UIMode_gamePlay',
  enter: function() {
    Game.Message.clear();
    Game.refresh();
    console.log("Game.UIMode.gameStart enter");
  },
  exit: function() {
    Game.refresh();
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function(eventType,evt) {
    var pressedKey = String.fromCharCode(evt.charCode);
    Game.Message.sendMessage("you pressed the '" + pressedKey + "' key");
    Game.renderMessage();
    console.log("Game.UIMode.gameStart handleInput");
    if(eventType == 'keypress'){
      if(evt.keyIdentifier == 'Enter') {
        Game.switchUIMode(Game.UIMode.gameWin);
        return;
      } else if(pressedKey == '1') {
        this.moveAvatar(-1,1);
      } else if(pressedKey == '2') {
        this.moveAvatar(0,1);
      } else if(pressedKey == '3') {
        this.moveAvatar(1,1);
      } else if(pressedKey == '4') {
        this.moveAvatar(-1,0);
      } else if(pressedKey == '5') {
        //Stay Still
      } else if(pressedKey == '6') {
        this.moveAvatar(1,0);
      } else if(pressedKey == '7') {
        this.moveAvatar(-1,-1);
      } else if(pressedKey == '8') {
        this.moveAvatar(0,-1);
      } else if(pressedKey == '9') {
        this.moveAvatar(1,-1);
      }
      Game.refresh();
    }
    else if(eventType == 'keydown') {
      if(evt.keyCode == 27){
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if(evt.keyCode == 187){
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.attr._map.renderOn(display,this.attr._cameraX,this.attr._cameraY)
    console.log("Game.UIMode.gameStart renderOnMain");
    display.drawText(1,3,"Press [Enter] to win, [Esc] to lose",fg,bg);
    display.drawText(1,4,"press = to save, load, or start a new game",fg,bg);
    this.renderAvatar(display);
  },
  renderAvatar: function (display) {
    Game.Symbol.AVATAR.draw(display,this.attr._avatarX-this.attr._cameraX+display._options.width/2,
                                    this.attr._avatarY-this.attr._cameraY+display._options.height/2);
  },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"avatar x: "+this.attr._avatarX,fg,bg); // DEV
    display.drawText(1,3,"avatar y: "+this.attr._avatarY,fg,bg); // DEV
  },
  moveAvatar: function (dx,dy) {
    this.attr._avatarX = Math.min(Math.max(0,this.attr._avatarX + dx),this.attr._mapWidth);
    this.attr._avatarY = Math.min(Math.max(0,this.attr._avatarY + dy),this.attr._mapHeight);
    this.setCameraToAvatar();
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.attr._mapWidth);
    this.attr._cameraY = Math.min(Math.max(0,sy),this.attr._mapHeight);
  },
  setCameraToAvatar: function () {
    this.setCamera(this.attr._avatarX,this.attr._avatarY);
  },
  setupPlay: function (restorationData) {
    var mapTiles = Game.util.init2DArray(this.attr._mapWidth,this.attr._mapHeight,Game.Tile.nullTile);
    var generator = new ROT.Map.Cellular(this.attr._mapWidth,this.attr._mapHeight);
    generator.randomize(0.5);

    // repeated cellular automata process
    var totalIterations = 3;
    for (var i = 0; i < totalIterations - 1; i++) {
      generator.create();
    }

    // run again then update map
    generator.create(function(x,y,v) {
      if (v === 1) {
        mapTiles[x][y] = Game.Tile.floorTile;
      } else {
        mapTiles[x][y] = Game.Tile.wallTile;
      }
    });

    // create map from the tiles
    this.attr._map =  new Game.Map(mapTiles);

    // restore anything else if the data is available
    if (restorationData !== undefined && restorationData.hasOwnProperty(Game.UIMode.gamePlay.JSON_KEY)) {
      this.fromJSON(restorationData[Game.UIMode.gamePlay.JSON_KEY]);
    }
  },
  toJSON: function() {
    var json = {};
    for (var at in this.attr) {
      if (this.attr.hasOwnProperty(at) && at!='_map') {
        json[at] = this.attr[at];
      }
    }
    return json;
  },
  fromJSON: function (json) {
    for (var at in this.attr) {
      if (this.attr.hasOwnProperty(at) && at!='_map') {
        this.attr[at] = json[at];
      }
    }
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
    Game.Message.clear();
    console.log("Game.UIMode.gameStart handleInput");
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gameStart renderOnMain");
    display.drawText(4,4,"You Lose",fg,bg);
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
    Game.Message.clear();
    console.log("Game.UIMode.gameStart handleInput");
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gameStart renderOnMain");
    display.drawText(4,4,"You Win",fg,bg);
  }
};
Game.UIMode.gamePersistence = {
  enter: function() {
      console.log("Game.UIMode.gamePersistence enter");
      Game.refresh();
  },
  exit: function() {
    console.log("Game.UIMode.gamePersistence exit");
    Game.refresh();
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
      Game.UIMode.gamePlay.setupPlay(state_data);
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },
  newGame: function() {
    Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupPlay();
    Game.switchUIMode(Game.UIMode.gamePlay);
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gamePersistence renderOnMain");
    display.drawText(1,3,"press S to save the current game, L to load the saved game, or N to start a new game",fg,bg);
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
