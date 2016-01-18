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
    if (this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    Game.TimeEngine.unlock();
    Game.refresh();
  },
  exit: function() {
    Game.refresh();
    Game.TimeEngine.lock();
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
    var tookTurn = false;
    // Game.Message.sendMessage("you pressed the '" + pressedKey + "' key");
    // Game.renderMessage();
    console.log("Game.UIMode.gamePlay handleInput");
    if(eventType == 'keypress'){
      var pressedKey = String.fromCharCode(evt.charCode);
      if(evt.keyCode == 13) {
        Game.switchUIMode(Game.UIMode.gameWin);
        return;
      } else if(pressedKey == '1') {
        tookTurn = this.moveAvatar(-1,1);
      } else if(pressedKey == '2') {
        tookTurn = this.moveAvatar(0,1);
      } else if(pressedKey == '3') {
        tookTurn = this.moveAvatar(1,1);
      } else if(pressedKey == '4') {
        tookTurn = this.moveAvatar(-1,0);
      } else if(pressedKey == '5') {
        //Stay Still
        tookTurn = true;
      } else if(pressedKey == '6') {
        tookTurn = this.moveAvatar(1,0);
      } else if(pressedKey == '7') {
        tookTurn = this.moveAvatar(-1,-1);
      } else if(pressedKey == '8') {
        tookTurn = this.moveAvatar(0,-1);
      } else if(pressedKey == '9') {
        tookTurn = this.moveAvatar(1,-1);
      }
    }
    else if(eventType == 'keydown') {
      if(evt.keyCode == 27){
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if(evt.keyCode == 187 || evt.keyCode == 61){
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
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
    //display.drawText(1,2,"avatar x: "+this.getAvatar().getX(),fg,bg); // DEV
    //display.drawText(1,3,"avatar y: "+this.getAvatar().getY(),fg,bg); // DEV
    display.drawText(1,2,"avatar health: " + this.getAvatar().getCurHp(),fg,fg);
    display.drawText(1,4,"avatar steps: "+this.attr._steps,fg,bg);
  },
  moveAvatar: function (dx,dy) {
    if(this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
      this.attr._steps++;
      var trip = Math.floor(Math.random()*1000001);
      if(trip === 666666) {
        Game.Message.sendMessage("You have fallen and can't get up.");
        Game.switchUIMode(Game.UIMode.gameLose);
      }
      return true;
    }
    return false;
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
    this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
  },
  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
  },
  setupNewGame: function () {
    // this.setMap(new Game.Map('main_town'));
    this.setMap(new Game.Map('main_town'));
    this.setAvatar(Game.EntityGenerator.create('avatar'));
  //  console.log(this.getAvatar());

    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkableLocation());
    this.setCameraToAvatar();

    this.getMap().addEntity(Game.EntityGenerator.create('Evan Williams'),this.getMap().getRandomWalkableLocation());

    for (var ecount = 0; ecount < 1; ecount++) {
      //this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkableLocation());
      //this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkableLocation());
      this.getMap().addEntity(Game.EntityGenerator.create('dog'),this.getMap().getRandomWalkableLocation());
    }
  },
  makeTrippy: function() {
      this.setMap(new Game.Map('caves1'));
      this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkableLocation());
      this.setCameraToAvatar();

      this.getMap().addEntity(Game.EntityGenerator.create('Evan Williams'),this.getMap().getRandomWalkableLocation());

      for (var ecount = 0; ecount < 50; ecount++) {
        this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkableLocation());
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
Game.UIMode.gamePlayMirror = {
  attr: {
    _mapId:'',
    _cameraX: 100,
    _cameraY: 100,
    _avatarId: '',
    _input: 0
  },
  JSON_KEY: 'UIMode_gamePlayMirror',
  enter: function() {
    Game.TimeEngine.unlock();
    Game.refresh();
  },
  exit: function() {
    Game.refresh();
    Game.TimeEngine.lock();
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
    var tookTurn = false;
    console.log("Game.UIMode.gamePlayMirror handleInput");
    if(eventType == 'keypress'){
      var pressedKey = String.fromCharCode(evt.charCode);
      if(pressedKey == '1') {
        tookTurn = this.moveAvatar(-1,1);
        this.attr._input++;
      } else if(pressedKey == '2') {
        tookTurn = this.moveAvatar(0,1);
        this.attr._input++;
      } else if(pressedKey == '3') {
        tookTurn = this.moveAvatar(1,1);
        this.attr._input++;
      } else if(pressedKey == '4') {
        tookTurn = this.moveAvatar(-1,0);
        this.attr._input++;
      } else if(pressedKey == '5') {
        //Stay Still
        tookTurn = true;
        this.attr._input++;
      } else if(pressedKey == '6') {
        tookTurn = this.moveAvatar(1,0);
        this.attr._input++;
      } else if(pressedKey == '7') {
        tookTurn = this.moveAvatar(-1,-1);
        this.attr._input++;
      } else if(pressedKey == '8') {
        tookTurn = this.moveAvatar(0,-1);
        this.attr._input++;
      } else if(pressedKey == '9') {
        tookTurn = this.moveAvatar(1,-1);
        this.attr._input++;
      }
    }
    else if(eventType == 'keydown') {
      console.log(evt);
      if(evt.keyCode == 27){
        this.returnToTown();
      }
    }

    if(this.attr._input === 400){
      this.returnToTown();
    }

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
  },
  returnToTown: function() {
    Game.UIMode.gamePlay.setAvatar(Game.UIMode.gamePlay.getAvatar());
    Game.UIMode.gamePlay.setCameraToAvatar();
    Game.switchUIMode(Game.UIMode.gamePlay);
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY);
  },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"Lose at 400 inputs",fg,bg);
    display.drawText(1,3,"or by pressing Esc",fg,bg);
    display.drawText(1,5,"# of inputs: "+this.attr._input,fg,bg);
  },
  moveAvatar: function (dx,dy) {
    if(this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      return true;
    }
    return false;
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
    this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
  },
  setCameraToMirror: function () {
    this.setCamera(this.getMap().getWidth()/2,this.getMap().getHeight()/2);
  },
  setupMirror: function () {
    this.setMap(new Game.Map('hallOfMirrors'));

    this.setAvatar(Game.EntityGenerator.create('avatar'));
    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkableLocation());
    this.setCameraToMirror();

    this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkableLocation());
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

    Game.DATASTORE.SCHEDULE = {};
    // NOTE: offsetting times by 1 so later restore can just drop them in and go
    Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = 1;
    for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
      Game.DATASTORE.SCHEDULE[Game.Scheduler._queue._events[i].getId()] = Game.Scheduler._queue._eventTimes[i] + 1;
    }
    Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1; // offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

    window.localStorage.setItem(Game._persistenceNamespace, JSON.stringify(Game.DATASTORE));
    Game.switchUIMode(Game.UIMode.gamePlay);
  }
},
loadGame: function() {
  if (this.localStorageAvailable()) {
    var json_state_data =  window.localStorage.getItem(Game._persistenceNamespace);
    var state_data = JSON.parse(json_state_data);

    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.initializeTimingEngine();
    // NOTE: the timing stuff is initialized here because we need to ensure that the stuff exists when entities are created, but the actual schedule restoration re-runs timing initialization

    Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

    for (var mapId in state_data.MAP) {
      if (state_data.MAP.hasOwnProperty(mapId)) {
        var mapAttr = JSON.parse(state_data.MAP[mapId]);
        Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
        Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
      }
    }

    ROT.RNG.getUniform(); // once the map is regenerated cycle the RNG so we're getting new data for entity generation

    for (var entityId in state_data.ENTITY) {
      if (state_data.ENTITY.hasOwnProperty(entityId)) {
        var entAttr = JSON.parse(state_data.ENTITY[entityId]);
        var newE = Game.EntityGenerator.create(entAttr._generator_template_key,entAttr._id);
        Game.DATASTORE.ENTITY[entityId] = newE;
        Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
      }
    }

    Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
    Game.Message.attr = state_data.MESSAGES;

    // schedule
    Game.initializeTimingEngine();
    for (var schedItemId in state_data.SCHEDULE) {
      if (state_data.SCHEDULE.hasOwnProperty(schedItemId)) {
        // check here to determine which data store thing will be added to the scheduler (and the actual addition may vary - e.g. not everyting will be a repeatable thing)
        if (Game.DATASTORE.ENTITY.hasOwnProperty(schedItemId)) {
          Game.Scheduler.add(Game.DATASTORE.ENTITY[schedItemId],true,state_data.SCHEDULE[schedItemId]);
        }
      }
    }
    Game.Scheduler._queue._time = state_data.SCHEDULE_TIME;

    Game.switchUIMode(Game.UIMode.gamePlay);
  }
},
newGame: function() {
  Game.DATASTORE = {};
  Game.DATASTORE.MAP = {};
  Game.DATASTORE.ENTITY = {};
  Game.initializeTimingEngine();
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
