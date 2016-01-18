Game.UIMode = {};

Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

//#############################################################################
//#############################################################################

Game.UIMode.gameStart = {
  enter: function() {
    //console.log("Game.UIMode.gameStart enter");
    Game.Message.sendMessage("Welcome to WSLR");
    Game.KeyBinding.setKeyBinding();
    Game.refresh();
  },
  exit: function() {
    console.log("Game.UIMode.gameStart exit");
    Game.KeyBinding.informPlayer();
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    console.log("Game.UIMode.gameStart handleInput");
    if(evt.charCode !== 0) {
      Game.switchUIMode('gamePersistence');
    }
  },
  renderOnMain: function(display) {
    display.drawText(1,1,Game.UIMode.DEFAULT_COLOR_STR+"game start");
    display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"press any key to continue");
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gamePlay = {
  attr: {
    _mapId:'',
    _avatarId:'',
    _cameraX: 100,
    _cameraY: 100,
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
    var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
    if ((!actionBinding) || (actionBinding.actionKey == 'CANCEL')) {
      return false;
    }
    var tookTurn = false;
    if (actionBinding.actionKey == 'MOVE_U') {
      tookTurn = this.moveAvatar(0, -1);
    } else if (actionBinding.actionKey == 'MOVE_L') {
      tookTurn = this.moveAvatar(-1, 0);
    } else if (actionBinding.actionKey == 'MOVE_WAIT') {
      tookTurn = true;
    } else if (actionBinding.actionKey == 'MOVE_R') {
      tookTurn = this.moveAvatar(1, 0);
    } else if (actionBinding.actionKey == 'MOVE_D') {
      tookTurn = this.moveAvatar(0, 1);
    } else if (actionBinding.actionKey == 'CHANGE_BINDINGS') {
      Game.KeyBinding.swapToNextKeyBinding();
    } else if (actionBinding.actionKey == 'PERSISTENCE') {
      Game.switchUIMode('gamePersistence');
    } else if (actionBinding.actionKey == 'HELP') {
      // console.log('TODO: set up help stuff for gameplay');
      Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
      Game.addUIMode('LAYER_textReading');
    }

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
    return false;
  },
  renderOnMain: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY);
  },
  renderAvatarInfo: function (display) {
    //display.drawText(1,2,"avatar x: "+this.getAvatar().getX(),fg,bg); // DEV
    //display.drawText(1,3,"avatar y: "+this.getAvatar().getY(),fg,bg); // DEV
    display.drawText(1,2,Game.UIMode.DEFAULT_COLOR_STR+"avatar health: " + this.getAvatar().getCurHp());
    display.drawText(1,4,Game.UIMode.DEFAULT_COLOR_STR+"avatar steps: "+this.attr._steps);
  },
  moveAvatar: function (dx,dy) {
    if(this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
      this.attr._steps++;
      var trip = Math.floor(Math.random()*1000001);
      if(trip === 666666) {
        Game.Message.sendMessage("You have fallen and can't get up.");
        Game.switchUIMode('gameLose');
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

//#############################################################################
//#############################################################################

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
    var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
    if ((!actionBinding) || (actionBinding.actionKey == 'CANCEL')) {
      this.returnToTown();
      return false;
    }
    var tookTurn = false;
    if (actionBinding.actionKey == 'MOVE_U') {
      tookTurn = this.moveAvatar(0, -1);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_L') {
      tookTurn = this.moveAvatar(-1, 0);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_WAIT') {
      tookTurn = true;
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_R') {
      tookTurn = this.moveAvatar(1, 0);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_D') {
      tookTurn = this.moveAvatar(0, 1);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'CHANGE_BINDINGS') {
      Game.KeyBinding.swapToNextKeyBinding();
    } else if (actionBinding.actionKey == 'PERSISTENCE') {
      Game.Message.sendMesage('You cannot save while in the Mirror World.');
    } else if (actionBinding.actionKey == 'HELP') {
      // console.log('TODO: set up help stuff for gameplay');
      Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
      Game.addUIMode('LAYER_textReading');
    }

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
    return false;
  },
  returnToTown: function() {
    Game.UIMode.gamePlay.setAvatar(Game.UIMode.gamePlay.getAvatar());
    Game.UIMode.gamePlay.setCameraToAvatar();
    Game.switchUIMode('gamePlay');
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

//#############################################################################
//#############################################################################

Game.UIMode.gameLose = {
  enter: function() {
    console.log("Game.UIMode.gameLose enter");
  },
  exit: function() {
    console.log("Game.UIMode.gameLose exit");
  },
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
      Game.switchUIMode('gamePersistence');
    }
    console.log("Game.UIMode.gameLose handleInput");
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    console.log("Game.UIMode.gameLose renderOnMain");
    display.drawText(4,4,Game.UIMode.DEFAULT_COLOR_STR+"OHHHH $H!7!!! YOU LOSE!!!");
  }
};

//#############################################################################
//#############################################################################

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
      Game.switchUIMode('gamePersistence');
    }
    console.log("Game.UIMode.gameWin handleInput");
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    console.log("Game.UIMode.gameWin renderOnMain");
    display.drawText(4,4,Game.UIMode.DEFAULT_COLOR_STR+"OHHHHH BABY! You win!");
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
  _storedKeyBinding: '',
  enter: function() {
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('persist');
    //console.log("Game.UIMode.gamePersistence enter");
    Game.refresh();
  },
  exit: function() {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    console.log("Game.UIMode.gamePersistence exit");
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    // console.log(inputType);
    // console.dir(inputData);
    var actionBinding = Game.KeyBinding.getInputBinding(eventType,evt);
    // console.log('action binding is');
    // console.dir(actionBinding);
    // console.log('----------');
    if (! actionBinding) {
      return false;
    }

    if (actionBinding.actionKey == 'PERSISTENCE_SAVE') {
      this.saveGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_LOAD') {
      this.loadGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_NEW') {
      this.newGame();
    } else if (actionBinding.actionKey == 'CANCEL') {
      if (Object.keys(Game.DATASTORE.MAP).length < 1) {
        this.newGame();
      } else {
        Game.switchUIMode('gamePlay');
      }
    } else if (actionBinding.actionKey == 'HELP') {
      // console.log('TODO: set up help stuff for gamepersistence');
      Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
      Game.addUIMode('LAYER_textReading');
    }
    return false;
  },
  saveGame: function() {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGES = Game.Message.attr;

      Game.DATASTORE.KEY_BINDING_SET = this.storedKeyBinding; // NOTE: not getting the key binding directly because it's set to 'persist when this ui mode is entered - the 'real' key binding is saved in _storedKeyBinding

      Game.DATASTORE.SCHEDULE = {};
      // NOTE: offsetting times by 1 so later restore can just drop them in and go
      Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = 1;
      for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
        Game.DATASTORE.SCHEDULE[Game.Scheduler._queue._events[i].getId()] = Game.Scheduler._queue._eventTimes[i] + 1;
      }
      Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1; // offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

      window.localStorage.setItem(Game._persistenceNamespace, JSON.stringify(Game.DATASTORE));
      Game.Message.sendMessage('game saved');
      Game.switchUIMode('gamePlay');
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
          Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName, mapId);
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
      this._storedKeyBinding = state_data.KEY_BINDING_SET; // NOTE: not setting the key binding directly because it's set to _storedKeyBinding when this ui mode is exited

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

      Game.Message.sendMessage('game loaded');
      Game.switchUIMode('gamePlay');
      Game.KeyBinding.informPlayer();
    }
  },
  newGame: function() {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.initializeTimingEngine();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.Message.sendMessage('new game started');
    Game.switchUIMode('gamePlay');
  },
  renderOnMain: function(display) {
    display.drawText(3,3,Game.UIMode.DEFAULT_COLOR_STR+"press S to save the current game, L to load the saved game, or N start a new one",70);
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
    return JSON.stringify(state);
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.LAYER_textReading = {
  _storedKeyBinding: '',
  _text: 'default',
  _renderY: 0,
  _renderScrollLimit: 0,
  enter: function () {
    this._renderY = 0;
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('LAYER_textReading');
    Game.refresh();
    Game.specialMessage("[Esc] to exit, [ and ] for scrolling");

    //console.log('game persistence');
  },
  exit: function () {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    setTimeout(function(){
       Game.refresh();
    }, 1);
  },
  render: function (display) {
    var dims = Game.util.getDisplayDim(display);
    var linesTaken = display.drawText(1,this._renderY,Game.UIMode.DEFAULT_COLOR_STR+this._text, dims.w-2);
    // console.log("linesTaken is "+linesTaken);
    // console.log("dims.h is "+dims.h);
    this._renderScrollLimit = dims.h - linesTaken;
    if (this._renderScrollLimit > 0) { this._renderScrollLimit=0; }
  },
  handleInput: function (inputType,inputData) {
    // console.log(inputType);
    // console.dir(inputData);
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
    // console.log('action binding is');
    // console.dir(actionBinding);
    // console.log('----------');
    if (! actionBinding) {
      return false;
    }

    if (actionBinding.actionKey == 'CANCEL') {
      Game.removeUIMode();
    }
    if        (actionBinding.actionKey == 'DATA_NAV_UP') {
      this._renderY++;
      if (this._renderY > 0) { this._renderY = 0; }
      Game.renderMain();
      return true;
    } else if (actionBinding.actionKey == 'DATA_NAV_DOWN') {
      this._renderY--;
      if (this._renderY < this._renderScrollLimit) { this._renderY = this._renderScrollLimit; }
      Game.renderMain();
      return true;
    }
    /*
 else if (actionBinding.actionKey == 'PERSISTENCE_NEW') {
      this.newGame();
    } else if (actionBinding.actionKey == 'CANCEL') {
      Game.switchUiMode('gamePlay');
    }
    */
    return false;
  },
  getText: function () {
    return this._text;
  },
  setText: function (t) {
    this._text = t;
    // for (var i = 0; i < 400; i++) {
    //   this._text += ' '+['sit','amet','consectetur','adipiscing elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua'].random();
    // }
  }
};
