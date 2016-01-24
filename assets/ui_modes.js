Game.UIMode = {};

Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

//#############################################################################
//#############################################################################

Game.UIMode.gameStart = {
  enter: function() {
    Game.Message.sendMessage("Welcome to the Life of Fat Tone");
    Game.KeyBinding.setKeyBinding();
    Game.refresh();
  },
  exit: function() {
    Game.KeyBinding.informPlayer();
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    if(evt.charCode !== 0) {
      Game.switchUIMode('gamePersistence');
    }
  },
  renderOnMain: function(display) {
    display.drawText(1,1,Game.UIMode.DEFAULT_COLOR_STR+"You are about to begin The Life of Fat Tone");
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
    _steps: 0,
    _trippy:false,
    _bumped: false
  },
  JSON_KEY: 'UIMode_gamePlay',
  enter: function() {
    if (this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    this.getMap().unlockTimingEngine();
    Game.refresh();
  },
  exit: function() {
    Game.refresh();
    this.getMap().lockTimingEngine();
  },
  hasBumped: function () {
    return this.attr._bumped;
  },
  setBumped: function (m) {
    this.attr._bumped = m;
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

    if (!actionBinding) return false;
    else if (this.hasBumped()) {
      if (actionBinding.actionKey == 'ANSWER_YES') {
        this.getAvatar().raiseSymbolActiveEvent('answeredQ','yes');
      } else if (actionBinding.actionKey == 'ANSWER_NO') {
        this.getAvatar().raiseSymbolActiveEvent('answeredQ','no');
      } else this.getAvatar().raiseSymbolActiveEvent('answeredQ','no answer')
      return;
    } else if (actionBinding.actionKey == 'CANCEL') return false
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
    } else if (actionBinding.actionKey == 'INVENTORY') {
      Game.addUIMode('LAYER_inventoryListing');
    } else if (actionBinding.actionKey == 'PICKUP') {
      var pickUpList = Game.util.objectArrayToIdArray(this.getAvatar().getMap().getItems(this.getAvatar().getPos()));
      if (pickUpList.length <= 1) {
        var pickupRes = this.getAvatar().pickupItems(pickUpList);
        tookTurn = pickupRes.numItemsPickedUp > 0;
      } else {
        Game.addUIMode('LAYER_inventoryPickup');
      }
    } else if (actionBinding.actionKey == 'DROP') {
      Game.addUIMode('LAYER_inventoryDrop');
    } else if (actionBinding.actionKey == 'EAT') {
      Game.addUIMode('LAYER_inventoryEat');
    } else if (actionBinding.actionKey == 'EXAMINE') {
      Game.addUIMode('LAYER_inventoryExamine');
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
      this.getAvatar().raiseSymbolActiveEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
    return false;
  },
  renderOnMain: function(display) {
    var seenCells = this.getAvatar().getVisibleCells();
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,{
      visibleCells:seenCells,
      maskedCells:this.getAvatar().getRememberedCoordsForMap()
    });
    this.getAvatar().rememberCoords(seenCells);
  },
  renderAvatarInfo: function (display) {
    var av = this.getAvatar();
    var y = 0;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"ATTACK");
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"Accuracy: "+av.getAttackHit());
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"Power: "+av.getAttackDamage());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"DEFENSE");
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"Dodging: "+av.getAttackAvoid());
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"Toughness: "+av.getDamageMitigation());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"LIFE: "+av.getCurHp()+"/"+av.getMaxHp());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"MOVES: "+av.getTurns());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"KILLS: "+av.getTotalKills());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+"GOLD: "+av.getCurrentMoney());
    y++;
    y += display.drawText(1,y,Game.UIMode.DEFAULT_COLOR_STR+av.getHungerStateDescr());
  },
  moveAvatar: function (pdx,pdy) {
    var moveResp = this.getAvatar().raiseSymbolActiveEvent('adjacentMove',{dx:pdx,dy:pdy});
    // if (this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
    if (moveResp.madeAdjacentMove && moveResp.madeAdjacentMove[0]) {
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
    this.getMap().initializeTimingEngine();
    this.setAvatar(Game.EntityGenerator.create('avatar'));
    //  console.log(this.getAvatar());

    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkablePosition());
    this.setCameraToAvatar();

    this.getMap().addEntity(Game.EntityGenerator.create('Evan Williams'),this.getMap().getRandomWalkablePosition());

    var itemPos = '';
    for (var ecount = 0; ecount < 4; ecount++) {
     this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkablePosition());
     this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkablePosition());
     this.getMap().addEntity(Game.EntityGenerator.create('angry squirrel'),this.getMap().getRandomWalkablePosition());
     this.getMap().addEntity(Game.EntityGenerator.create('attack slug'),this.getMap().getRandomWalkablePosition());

     itemPos = this.getMap().getRandomWalkablePosition();
     this.getMap().addItem(Game.ItemGenerator.create('rock'),itemPos);

     itemPos = this.getMap().getRandomWalkablePosition();
     this.getMap().addItem(Game.ItemGenerator.create('apple'),itemPos);
    }
    this.getMap().addItem(Game.ItemGenerator.create('rock'),itemPos);

    Game.Message.sendMessage("Kill 3 or more attack slugs to win!");
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
    this.getMap().unlockTimingEngine();
    Game.refresh();
  },
  exit: function() {
    Game.refresh();
    this.getMap().lockTimingEngine();
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
    if (actionBinding.actionKey == 'CANCEL') {
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
    } else if (actionBinding.actionKey == 'INVENTORY') {
      Game.addUIMode('LAYER_inventoryListing');
    } else if (actionBinding.actionKey == 'PICKUP') {
      var pickUpList = Game.util.objectArrayToIdArray(this.getAvatar().getMap().getItems(this.getAvatar().getPos()));
      if (pickUpList.length <= 1) {
        var pickupRes = this.getAvatar().pickupItems(pickUpList);
        tookTurn = pickupRes.numItemsPickedUp > 0;
      } else {
        Game.addUIMode('LAYER_inventoryPickup');
      }
    } else if (actionBinding.actionKey == 'DROP') {
      Game.addUIMode('LAYER_inventoryDrop');
    } else if (actionBinding.actionKey == 'EAT') {
      Game.addUIMode('LAYER_inventoryEat');
    } else if (actionBinding.actionKey == 'EXAMINE') {
      Game.addUIMode('LAYER_inventoryExamine');
    } else if (actionBinding.actionKey == 'CHANGE_BINDINGS') {
      Game.KeyBinding.swapToNextKeyBinding();
    } else if (actionBinding.actionKey == 'PERSISTENCE') {
      Game.Message.sendMessage('You cannot save or load within the Hall of Mirrors');
    } else if (actionBinding.actionKey == 'HELP') {
      // console.log('TODO: set up help stuff for gameplay');
      Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
      Game.addUIMode('LAYER_textReading');
    }

    if (tookTurn) {
      this.getAvatar().raiseSymbolActiveEvent('actionDone');
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
    this.getMap().renderAll(display,this.attr._cameraX,this.attr._cameraY);
  },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"Lose at 400 inputs",fg,bg);
    display.drawText(1,3,"or by pressing Esc",fg,bg);
    display.drawText(1,5,"# of inputs: "+this.attr._input,fg,bg);
  },
  moveAvatar: function (pdx,pdy) {
    var moveResp = this.getAvatar().raiseSymbolActiveEvent('adjacentMove',{dx:pdx,dy:pdy});
    // if (this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
    if (moveResp.madeAdjacentMove && moveResp.madeAdjacentMove[0]) {
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
    this.getMap().initializeTimingEngine();
    this.attr._input = 0;
    this.setAvatar(Game.EntityGenerator.create('mirrorAvatar'));
    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkablePosition());
    this.setCameraToMirror();
    this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkablePosition());
    Game.Message.sendMessage('Try to get to the moss to win!');
    Game.Message.ageMessages();
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
    Game.Message.clearMessage();
    Game.renderAvatar();
    Game.renderMain();
  },
  exit: function() {
  },
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
      Game.switchUIMode('gamePersistence');
    }
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    display.drawText(4,4,Game.UIMode.DEFAULT_COLOR_STR+"OHHHH $H!7!!! YOU LOSE!!!");
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gameWin = {
  enter: function() {
    Game.Message.clearMessage();
    Game.renderAvatar();
    Game.renderMain();
  },
  exit: function() {
  },
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
      Game.switchUIMode('gamePersistence');
    }
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
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
    Game.refresh();
  },
  exit: function() {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    console.log("Game.UIMode.gamePersistence exit");
    Game.refresh();
  },
  handleInput: function(eventType,evt) {
    var actionBinding = Game.KeyBinding.getInputBinding(eventType,evt);
    if (! actionBinding) {
      return false;
    }

    if (actionBinding.actionKey == 'PERSISTENCE_SAVE') {
      if (!Game.UIMode.gamePlay.getMap()) {
        Game.Message.sendMessage('You have no game to save!');
      } else
        this.saveGame(Game.UIMode.gamePlay.getMap());
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
  saveGame: function(gameMap) {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGES = Game.Message.attr;

      Game.DATASTORE.KEY_BINDING_SET = this.storedKeyBinding; // NOTE: not getting the key binding directly because it's set to 'persist when this ui mode is entered - the 'real' key binding is saved in _storedKeyBinding

      Game.DATASTORE.SCHEDULE = {};
      // NOTE: offsetting times by 1 so later restore can just drop them in and go
      Game.DATASTORE.SCHEDULE[gameMap.getScheduler()._current.getId()] = 1;
      for (var i = 0; i < gameMap.getScheduler()._queue._eventTimes.length; i++) {
        Game.DATASTORE.SCHEDULE[gameMap.getScheduler()._queue._events[i].getId()] = gameMap.getScheduler()._queue._eventTimes[i] + 1;
      }
      Game.DATASTORE.SCHEDULE_TIME = gameMap.getScheduler()._queue.getTime() - 1; // offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

      window.localStorage.setItem(Game._persistenceNamespace, JSON.stringify(Game.DATASTORE));
      Game.Message.sendMessage('game saved');
      Game.switchUIMode('gamePlay');
    }
  },
  loadGame: function() {
    if (this.localStorageAvailable()) {
      var json_state_data =  window.localStorage.getItem(Game._persistenceNamespace);
      var state_data = JSON.parse(json_state_data);
      this._resetGameDataStructures();

      Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

      var loadedMap = null;
      for (var mapId in state_data.MAP) {
        if (state_data.MAP.hasOwnProperty(mapId)) {
          var mapAttr = JSON.parse(state_data.MAP[mapId]);
          Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName, mapId);
          Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
          loadedMap = Game.DATASTORE.MAP[mapId];
          loadedMap.initializeTimingEngine();
        }
      }

      if (!loadedMap) {
        Game.Message.sendMessage('You have no game to load');
        return;
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

      // items
      for (var itemId in state_data.ITEM) {
        if (state_data.ITEM.hasOwnProperty(itemId)) {
          var itemAttr = JSON.parse(state_data.ITEM[itemId]);
          var newI = Game.ItemGenerator.create(itemAttr._generator_template_key,itemAttr._id);
          Game.DATASTORE.ITEM[itemId] = newI;
          Game.DATASTORE.ITEM[itemId].fromJSON(state_data.ITEM[itemId]);
        }
      }

      Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
      Game.Message.attr = state_data.MESSAGES;
      this._storedKeyBinding = state_data.KEY_BINDING_SET; // NOTE: not setting the key binding directly because it's set to _storedKeyBinding when this ui mode is exited

      // schedule
      for (var schedItemId in state_data.SCHEDULE) {
        if (state_data.SCHEDULE.hasOwnProperty(schedItemId)) {
          // check here to determine which data store thing will be added to the scheduler (and the actual addition may vary - e.g. not everyting will be a repeatable thing)
          if (Game.DATASTORE.ENTITY.hasOwnProperty(schedItemId)) {
            loadedMap.getScheduler().add(Game.DATASTORE.ENTITY[schedItemId],true,state_data.SCHEDULE[schedItemId]);
          }
        }
      }
      loadedMap.getScheduler()._queue._time = state_data.SCHEDULE_TIME;

      Game.Message.sendMessage('game loaded');
      Game.switchUIMode('gamePlay');
      Game.KeyBinding.informPlayer();
    }
  },
  newGame: function() {
    this._resetGameDataStructures();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.Message.sendMessage('new game started');
    Game.switchUIMode('gamePlay');
  },
  _resetGameDataStructures: function () {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.DATASTORE.ITEM = {};
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
  renderOnMain: function (display) {
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
    return false;
  },
  getText: function () {
    return this._text;
  },
  setText: function (t) {
    this._text = t;
  }
};
//#############################################################################
//#############################################################################

Game.UIMode.LAYER_itemListing = function(template) {
  template = template ? template : {};

  this._caption = template.caption || 'Items';
  this._processingFunction = template.processingFunction;
  this._filterListedItemsOnFunction = template.filterListedItemsOn || function(itemId) {
      return itemId;
  };
  this._canSelectItem = template.canSelect || false;
  this._canSelectMultipleItems = template.canSelectMultipleItems || false;
  this._hasNoItemOption = template.hasNoItemOption || false;
  this._origItemIdList= template.itemIdList ? JSON.parse(JSON.stringify(template.itemIdList)) : [];
  this._itemIdList = [];
  this._runFilterOnItemIdList();
  this._keyBindingName= template.keyBindingName || 'LAYER_itemListing';

  this._selectedItemIdxs= [];
  this._displayItemsStartIndex = 0;
  this._displayItems = [];
  this._displayMaxNum = Game.getDisplayHeight('main')-3;
  this._numItemsShown = 0;
};

Game.UIMode.LAYER_itemListing.prototype._runFilterOnItemIdList = function () {
  this._itemIdList = [];
  for (var i = 0; i < this._origItemIdList.length; i++) {
    if (this._filterListedItemsOnFunction(this._origItemIdList[i])) {
      this._itemIdList.push(this._origItemIdList[i]);
    }
  }
};

Game.UIMode.LAYER_itemListing.prototype.enter = function () {
  this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
  Game.KeyBinding.setKeyBinding(this._keyBindingName);
  if ('doSetup' in this) {
    this.doSetup();
  }
  Game.refresh();
};
Game.UIMode.LAYER_itemListing.prototype.exit = function () {
  Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
  setTimeout(function(){
     Game.refresh();
  }, 1);
};
Game.UIMode.LAYER_itemListing.prototype.setup = function(setupParams) {
  setupParams = setupParams ? setupParams : {};

  if (setupParams.hasOwnProperty('caption')) {
    this._caption = setupParams.caption;
  }
  if (setupParams.hasOwnProperty('processingFunction')) {
    this._processingFunction = setupParams.processingFunction;
  }
  if (setupParams.hasOwnProperty('filterListedItemsOn')) {
    this._filterListedItemsOnFunction = setupParams.filterListedItemsOn;
    this._runFilterOnItemIdList();
  }
  if (setupParams.hasOwnProperty('canSelect')) {
    this._canSelectItem = setupParams.canSelect;
  }
  if (setupParams.hasOwnProperty('canSelectMultipleItems')) {
    this._canSelectMultipleItems = setupParams.canSelectMultipleItems;
  }
  if (setupParams.hasOwnProperty('hasNoItemOption')) {
    this._hasNoItemOption = setupParams.hasNoItemOption;
  }
  if (setupParams.hasOwnProperty('itemIdList')) {
    this._origItemIdList= JSON.parse(JSON.stringify(setupParams.itemIdList));
    this._runFilterOnItemIdList();
  }
  if (setupParams.hasOwnProperty('keyBindingName')) {
    this._keyBindingName= setupParams.keyBindingName;
  }

  this._selectedItemIdxs= [];
  this._displayItemsStartIndex = 0;
  this._displayItems = [];
  this.determineDisplayItems();
  this._numItemsShown = 0;
};

Game.UIMode.LAYER_itemListing.prototype.getItemList = function () {
  return this._itemIdList;
};
Game.UIMode.LAYER_itemListing.prototype.setItemList = function (itemList) {
  this._itemIdList = itemList;
};
Game.UIMode.LAYER_itemListing.prototype.getKeyBindingName = function () {
  return this._keyBindingName;
};
Game.UIMode.LAYER_itemListing.prototype.setKeyBindingName = function (keyBindingName) {
  this._keyBindingName = keyBindingName;
};

Game.UIMode.LAYER_itemListing.prototype.determineDisplayItems = function() {
    this._displayItems = this._itemIdList.slice(this._displayItemsStartIndex,this._displayItemsStartIndex+this._displayMaxNum).map(function(itemId) { return Game.DATASTORE.ITEM[itemId]; });
};
Game.UIMode.LAYER_itemListing.prototype.handlePageUp = function() {
    this._displayItemsStartIndex -= this._displayMaxNum;
    if (this._displayItemsStartIndex < 0) {
        this._displayItemsStartIndex = 0;
    }
    this.determineDisplayItems();
    Game.refresh();
};
Game.UIMode.LAYER_itemListing.prototype.handlePageDown = function() {
    var numUnseenItems = this._itemIdList.length - (this._displayItemsStartIndex + this._displayItems.length);
    this._displayItemsStartIndex += this._displayMaxNum;
    if (this._displayItemsStartIndex > this._itemIdList.length) {
        this._displayItemsStartIndex -= this._displayMaxNum;
    }
    this.determineDisplayItems();
    Game.refresh();
};

Game.UIMode.LAYER_itemListing.prototype.getCaptionText = function () {
  var captionText = 'Items';
  if (typeof this._caption == 'function') {
    captionText = this._caption();
  } else {
    captionText = this._caption;
  }
  return captionText;
};

Game.UIMode.LAYER_itemListing.prototype.renderOnMain = function (display) {
  var selectionLetters = 'abcdefghijklmnopqrstuvwxyz';
  display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR + this.getCaptionText());

  if (this._displayItems.length < 1) {
    display.drawText(0, 2, Game.UIMode.DEFAULT_COLOR_STR + 'nothing for '+ this.getCaptionText().toLowerCase());
    return;
  }

  var row = 0;

  if (this._hasNoItemOption) {
    display.drawText(0, 1, Game.UIMode.DEFAULT_COLOR_STR + '0 - no item');
    row++;
  }
  if (this._displayItemsStartIndex > 0) {
    display.drawText(0, 1 + row, '%c{black}%b{yellow}[ for more');
    row++;
  }
  this._numItemsShown = 0;
  for (var i = 0; i < this._displayItems.length; i++) {
    var trueItemIndex = this._displayItemsStartIndex + i;
    if (this._displayItems[i]) {
      var selectionLetter = selectionLetters.substring(i, i + 1);

      // If we have selected an item, show a +, else show a space between the selectionLetter and the item's name.
      var selectionState = (this._canSelectItem && this._canSelectMultipleItems && this._selectedItemIdxs[trueItemIndex]) ? '+' : ' ';

      var item_symbol = this._displayItems[i].getRepresentation()+Game.UIMode.DEFAULT_COLOR_STR;
      display.drawText(0, 1 + row, Game.UIMode.DEFAULT_COLOR_STR + selectionLetter + ' ' + selectionState + ' ' + item_symbol + ' ' +this._displayItems[i].getName());
      row++;
      this._numItemsShown++;
    }
  }
  if ((this._displayItemsStartIndex + this._displayItems.length) < this._itemIdList.length) {
    display.drawText(0, 1 + row, '%c{black}%b{yellow}] for more');
    row++;
  }
};


Game.UIMode.LAYER_itemListing.prototype.executeProcessingFunction = function() {
  // Gather the selected item ids
  var selectedItemIds = [];
  for (var selectionIndex in this._selectedItemIdxs) {
    if (this._selectedItemIdxs.hasOwnProperty(selectionIndex)) {
      selectedItemIds.push(this._itemIdList[selectionIndex]);
    }
  }
  Game.removeUIModeAllLayers();
  // Call the processing function and end the player's turn if it returns true.
  if (this._processingFunction(selectedItemIds)) {
    Game.getAvatar().raiseSymbolActiveEvent('actionDone');
    setTimeout(function(){
       Game.Message.ageMessages();
    }, 1);
  }
};

Game.UIMode.LAYER_itemListing.prototype.handleInput = function (inputType,inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
  if (! actionBinding) {
    if ((inputType === 'keydown') && this._canSelectItem && inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
      // Check if it maps to a valid item by subtracting 'a' from the character to know what letter of the alphabet we used.
      var index = inputData.keyCode - ROT.VK_A;
      if (index >= this._numItemsShown) {
        return false;
      }
      var trueItemIndex = this._displayItemsStartIndex + index;
      if (this._itemIdList[trueItemIndex]) {
        // If multiple selection is allowed, toggle the selection status, else select the item and process it
        if (this._canSelectMultipleItems) {
            if (this._selectedItemIdxs[trueItemIndex]) {
              delete this._selectedItemIdxs[trueItemIndex];
            } else {
              this._selectedItemIdxs[trueItemIndex] = true;
            }
            Game.refresh();
        } else {
          this._selectedItemIdxs[trueItemIndex] = true;
          this.executeProcessingFunction();
        }
      } else {
        return false;
      }
    }
  }

  if (actionBinding.actionKey == 'CANCEL') {
    Game.removeUIMode();

  } else if (actionBinding.actionKey == 'PROCESS_SELECTIONS') {
    this.executeProcessingFunction();

  } else if (this._canSelectItem && this._hasNoItemOption && (actionBinding.actionKey == 'SELECT_NOTHING')) {
    this._selectedItemIdxs = {};

  } else if (actionBinding.actionKey == 'DATA_NAV_UP') {
    this.handlePageUp();

  } else if (actionBinding.actionKey == 'DATA_NAV_DOWN') {
    this.handlePageDown();

  } else if (actionBinding.actionKey == 'HELP') {
    var helpText = this.getCaptionText()+"\n";
    if (this._canSelectItem || this._canSelectMultipleItems) {
      var lastSelectionLetter = (String.fromCharCode(ROT.VK_A + this._numItemsShown-1)).toLowerCase();
      helpText += "a-"+lastSelectionLetter+"   select the indicated item\n";
    }
    helpText += Game.KeyBinding.getBindingHelpText();
    Game.UIMode.LAYER_textReading.setText(helpText);
    Game.addUIMode('LAYER_textReading');
  }

  return false;
};

//-------------------

Game.UIMode.LAYER_inventoryListing = new Game.UIMode.LAYER_itemListing({
    caption: 'Inventory',
    canSelect: false,
    keyBindingName: 'LAYER_inventoryListing'
});
Game.UIMode.LAYER_inventoryListing.doSetup = function () {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIds()});
};

Game.UIMode.LAYER_inventoryListing.handleInput = function (inputType,inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);

  if (actionBinding) {
    if (actionBinding.actionKey == 'EXAMINE') {
      Game.addUIMode('LAYER_inventoryExamine');
      return false;
    }
    if (actionBinding.actionKey == 'DROP') {
      Game.addUIMode('LAYER_inventoryDrop');
      return false;
    }
    if (actionBinding.actionKey == 'EAT') {
      Game.addUIMode('LAYER_inventoryEat');
      return false;
    }
  }
  return Game.UIMode.LAYER_itemListing.prototype.handleInput.call(this,inputType,inputData);
};

//-------------------

Game.UIMode.LAYER_inventoryDrop = new Game.UIMode.LAYER_itemListing({
    caption: 'Drop',
    canSelect: true,
    canSelectMultipleItems: true,
    keyBindingName: 'LAYER_inventoryDrop',
    processingFunction: function (selectedItemIds) {
      if (selectedItemIds.length < 1) {
        return false;
      }
      var dropResult = Game.getAvatar().dropItems(selectedItemIds);
      return dropResult.numItemsDropped > 0;
    }
});
Game.UIMode.LAYER_inventoryDrop.doSetup = function () {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIds()});
};

//-------------------

Game.UIMode.LAYER_inventoryPickup = new Game.UIMode.LAYER_itemListing({
    caption: 'Pick up',
    canSelect: true,
    canSelectMultipleItems: true,
    keyBindingName: 'LAYER_inventoryPickup',
    processingFunction: function (selectedItemIds) {
      var pickupResult = Game.getAvatar().pickupItems(selectedItemIds);
      return pickupResult.numItemsPickedUp > 0;
    }
});
Game.UIMode.LAYER_inventoryPickup.doSetup = function () {
  this.setup({itemIdList: Game.util.objectArrayToIdArray(Game.getAvatar().getMap().getItems(Game.getAvatar().getPos()))});
};

//-------------------

Game.UIMode.LAYER_inventoryExamine = new Game.UIMode.LAYER_itemListing({
    caption: 'Examine',
    canSelect: true,
    keyBindingName: 'LAYER_inventoryExamine',
    processingFunction: function (selectedItemIds) {
      //console.log('LAYER_inventoryExamine processing on '+selectedItemIds[0]);
      if (selectedItemIds[0]) {
        var d = Game.DATASTORE.ITEM[selectedItemIds[0]].getDetailedDescription();
        setTimeout(function() { // delay here because of the general refresh on exiting the layer
           Game.specialMessage(d);
        }, 2);
      }
      return false;
    }
});
Game.UIMode.LAYER_inventoryExamine.doSetup = function () {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIds()});
};

//-------------------

Game.UIMode.LAYER_inventoryEat = new Game.UIMode.LAYER_itemListing({
    caption: 'Eat',
    canSelect: true,
    keyBindingName: 'LAYER_inventoryEat',
    filterListedItemsOn: function(itemId) {
      return  Game.DATASTORE.ITEM[itemId].hasMixin('Food');
    },
    processingFunction: function (selectedItemIds) {
      if (selectedItemIds[0]) {
        var foodItem = Game.getAvatar().extractInventoryItems([selectedItemIds[0]])[0];
//        Game.util.cdebug(foodItem);
        Game.getAvatar().eatFood(foodItem.getFoodValue());
        return true;
      }
      return false;
    }
});
Game.UIMode.LAYER_inventoryEat.doSetup = function () {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIds()});
};
