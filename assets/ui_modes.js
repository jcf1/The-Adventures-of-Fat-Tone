Game.UIMode = {};

Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function() {
    //console.log("Game.UIMode.gameStart enter");
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
    _mapId:'',
    _cameraX: 100,
    _cameraY: 100,
    _avatarId: '',
    _steps: 0
  },
  JSON_KEY: 'UIMode_gamePlay',
  enter: function() {
    //Game.Message.clearMessage();
    if (this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    Game.refresh();
    //console.log("Game.UIMode.gamePlay enter");
  },
  exit: function() {
    Game.refresh();
    console.log("Game.UIMode.gamePlay exit");
  },
  getMap: function () {
    return Game.DATASTORE.MAP[this.attr._mapId];
  },
  setMap: function (m) {
    this.attr._mapId = m.getId();
  },
  getAvatar: function () {
    return Game.DATASTORE.ENTITY[this.attr._avatarId];
  },
  setAvatar: function (a) {
    this.attr._avatarId = a.getId();
  },
  handleInput: function(eventType,evt) {
    var pressedKey = String.fromCharCode(evt.charCode);
    // Game.Message.sendMessage("you pressed the '" + pressedKey + "' key");
    // Game.renderMessage();
    console.log("Game.UIMode.gamePlay handleInput");
    if(eventType == 'keypress'){
      if(evt.keyCode == 13) {
        Game.switchUIMode(Game.UIMode.gameWin);
        return;
      } else if(pressedKey == '1') {
        this.moveAvatar(-1,1);
        Game.Message.ageMessages();
      } else if(pressedKey == '2') {
        this.moveAvatar(0,1);
        Game.Message.ageMessages();
      } else if(pressedKey == '3') {
        this.moveAvatar(1,1);
        Game.Message.ageMessages();
      } else if(pressedKey == '4') {
        this.moveAvatar(-1,0);
        Game.Message.ageMessages();
      } else if(pressedKey == '5') {
        //Stay Still
        Game.Message.ageMessages();
      } else if(pressedKey == '6') {
        this.moveAvatar(1,0);
        Game.Message.ageMessages();
      } else if(pressedKey == '7') {
        this.moveAvatar(-1,-1);
        Game.Message.ageMessages();
      } else if(pressedKey == '8') {
        this.moveAvatar(0,-1);
        Game.Message.ageMessages();
      } else if(pressedKey == '9') {
        this.moveAvatar(1,-1);
        Game.Message.ageMessages();
      }
    }
    else if(eventType == 'keydown') {
      if(evt.keyCode == 27){
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if(evt.keyCode == 187 || evt.keyCode == 61){
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    // this.attr._map.renderOn(display,this.attr._cameraX,this.attr._cameraY)
    // console.log("Game.UIMode.gamePlay renderOnMain");
    // display.drawText(1,3,"Press [Enter] to win, [Esc] to lose",fg,bg);
    // display.drawText(1,4,"press = to save, load, or start a new game",fg,bg);
    // this.renderAvatar(display);
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY);
  },
  // renderAvatar: function (display) {
  //   Game.Symbol.AVATAR.draw(display,this.attr._avatar.getX()-this.attr._cameraX+display._options.width/2,
  //   this.attr._avatar.getY()-this.attr._cameraY+display._options.height/2);
  // },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"avatar x: "+this.getAvatar().getX(),fg,bg); // DEV
    display.drawText(1,3,"avatar y: "+this.getAvatar().getY(),fg,bg); // DEV
    display.drawText(1,4,"avatar steps: "+this.attr._steps,fg,bg);
  },
  moveAvatar: function (dx,dy) {
    if(this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
      this.attr._steps++;
      var trip = Math.floor(Math.random()*1000001);
      if(trip === 1) {
        Game.Message.sendMessage("You have fallen and can't get up.");
        Game.switchUIMode(Game.UIMode.gameLose);
      }
    }
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
    this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
    Game.refresh();
  },
  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
  },
  setupNewGame: function () {
    this.setMap(new Game.Map('main_town'));
    this.setAvatar(Game.EntityGenerator.create('avatar'));
    console.log(this.getAvatar());

    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkableLocation());
    this.setCameraToAvatar();

    for (var ecount = 0; ecount < 80; ecount++) {
      this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkableLocation());
    }
    for (var ecount = 0; ecount < 50; ecount++) {
      this.getMap().addEntity(Game.EntityGenerator.create('dog'),this.getMap().getRandomWalkableLocation());
    }
  },
  toJSON: function() {
    return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  },
  fromJSON: function (json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
  }
};
Game.UIMode.gameLose = {
  enter: function() {
    console.log("Game.UIMode.gameLose enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameLose exit");
  },
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
        Game.switchUIMode(Game.UIMode.gamePersistence);
    }
    console.log("Game.UIMode.gameLose handleInput");
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gameLose renderOnMain");
    display.drawText(4,4,"OHHHH $H!7!!! YOU LOSE!!!",fg,bg);
  }
};
Game.UIMode.gameWin = {
  enter: function() {
    Game.Message.clearMessage();
    console.log("Game.UIMode.gameWin enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameWin exit");
  },
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
        Game.switchUIMode(Game.UIMode.gamePersistence);
    }
    console.log("Game.UIMode.gameWin handleInput");
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    console.log("Game.UIMode.gameWin renderOnMain");
    display.drawText(4,4,"OHHHHH BABY! You win!",fg,bg);
  }
};
Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
  enter: function() {
    //console.log("Game.UIMode.gamePersistence enter");
    Game.refresh();
  },
  exit: function() {
    console.log("Game.UIMode.gamePersistence exit");
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gamePersistence handleInput");
    if (eventType == 'keypress') {
      var inputChar = String.fromCharCode(evt.charCode);
      if (inputChar == 'S') { // ignore the various modding keys - control, shift, etc.
        this.saveGame();
      } else if (inputChar == 'L') {
        this.loadGame();
      } else if (inputChar == 'N') {
        this.newGame();
      }
    } else if (eventType == 'keydown') {
      if (evt.keyCode == 27) { // 'Escape'
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    }
  },
  saveGame: function() {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGES = Game.Message.attr;
      window.localStorage.setItem(Game._persistenceNamespace, JSON.stringify(Game.DATASTORE));
      console.log("post-save: using random seed "+Game.getRandomSeed());
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },
  loadGame: function() {
    if (this.localStorageAvailable()) {
      var json_state_data =  window.localStorage.getItem(Game._persistenceNamespace);
      var state_data = JSON.parse(json_state_data);

      Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

      for (var mapId in state_data.MAP) {
        if (state_data.MAP.hasOwnProperty(mapId)) {
          var mapAttr = JSON.parse(state_data.MAP[mapId]);
          // console.log("restoring map "+mapId+" with attributes:");
          // console.dir(mapAttr);
          Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
          Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
        }
      }

      for (var entityId in state_data.ENTITY) {
        if (state_data.ENTITY.hasOwnProperty(entityId)) {
          var entAttr = JSON.parse(state_data.ENTITY[entityId]);
          Game.DATASTORE.ENTITY[entityId] = Game.EntityGenerator.create(entAttr._generator_template_key);
          Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
        }
      }

      Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
      Game.Message.attr = state_data.MESSAGES;

      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },
  newGame: function() {
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
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
  },
  BASE_toJSON: function(state_hash_name) {
    var state = this.attr;
    if (state_hash_name) {
      state = this[state_hash_name];
    }
    var json = JSON.stringify(state);
    // var json = {};
    // for (var at in state) {
    //   if (state.hasOwnProperty(at)) {
    //     if (state[at] instanceof Object && 'toJSON' in state[at]) {
    //       json[at] = state[at].toJSON();
    //     } else {
    //       json[at] = state[at];
    //     }
    //   }
    // }
    return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
    // for (var at in this[using_state_hash]) {
    //   if (this[using_state_hash].hasOwnProperty(at)) {
    //     if (this[using_state_hash][at] instanceof Object && 'fromJSON' in this[using_state_hash][at]) {
    //       this[using_state_hash][at].fromJSON(json[at]);
    //     } else {
    //       this[using_state_hash][at] = json[at];
    //     }
    //   }
    // }
  }
};
