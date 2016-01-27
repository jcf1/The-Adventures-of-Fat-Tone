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
      Game.UIMode.gamePlay.setupNewGame();
      Game.switchUIMode('gamePlay');
      Game.UIMode.LAYER_textReading.setText(Game.getStoryBeginning());
      Game.addUIMode('LAYER_textReading');
    }
  },
  renderOnMain: function(display) {
    display.drawText(18,11,Game.UIMode.DEFAULT_COLOR_STR+"You are about to begin The Life of Fat Tone!");
    display.drawText(27,13,Game.UIMode.DEFAULT_COLOR_STR+"Press any key to continue.");
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
    _trippy: false,
    _drunk: false,
    _win: false,
    _bumped: false,
    _prevX: 0,
    _prevY: 0,
    _saidNo: false
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
  removeAvatar: function() {
    this.getMap().extractEntity(this.getAvatar());
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
    } else if (actionBinding.actionKey == 'CANCEL') {
      if(this.getMap().getTileSetName() != 'main_town') {
        this.returnToTown();
        return false;
      }
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
    if (this.attr._drunk) {
      var seenCells = this.getAvatar().getVisibleCells();
      this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,{
        visibleCells:seenCells,
        maskedCells: null
      });
    } else if (this.getMap().getTileSetName().indexOf('town') > -1){
      this.getMap().renderAll(display,this.attr._cameraX,this.attr._cameraY);
    } else {
      var seenCells = this.getAvatar().getVisibleCells();
      this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,{
        visibleCells:seenCells,
        maskedCells:this.getAvatar().getRememberedCoordsForMap()
      });
      this.getAvatar().rememberCoords(seenCells);
    }
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
      var trip = Math.floor(Math.random()*1000000);
      if(trip === 666) {
        Game.switchUIMode('gameLose');
        Game.Message.sendMessage("You have fallen and can't get up.");
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
  returnToTown: function() {
    this.getAvatar().setCurHp(21);
    if(this.attr._drunk && !(this.attr._trippy)) {
      Game.UIMode.LAYER_textReading.setText(Game.getStoryDrunkNH());
      Game.addUIMode('LAYER_textReading');
      this.setMap(new Game.Map('main_town'));
    } else if (this.attr._trippy && !(this.attr._drunk)) {
      Game.UIMode.LAYER_textReading.setText(Game.getStoryHighND());
      Game.addUIMode('LAYER_textReading');
      this.setMap(new Game.Map('main_town'));
    }
    else if(this.attr._drunk && this.attr._trippy){
      Game.UIMode.LAYER_textReading.setText(Game.getStoryCross());
      Game.addUIMode('LAYER_textReading');
      this.setMap(new Game.Map('main_town_cas'));
    } else if(this.attr._win) {
      Game.UIMode.LAYER_textReading.setText(Game.getStoryGoHome(this.attr._saidNo));
      Game.addUIMode('LAYER_textReading');
      this.setMap(new Game.Map('main_town_bed'));
    }
    this.getMap().initializeTimingEngine();
    this.getMap().addEntity(this.getAvatar(),{x:this.attr._prevX,y:this.attr._prevY});
    this.setCameraToAvatar();
    Game.renderMain();
  },
  setupNewGame: function () {
    this.setMap(new Game.Map('main_town'));
    this.getMap().initializeTimingEngine();
    this.setAvatar(Game.EntityGenerator.create('avatar'));
    //  console.log(this.getAvatar());

    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkablePosition());
    this.setCameraToAvatar();

    for (var ecount = 0; ecount < 30; ecount++) {
      this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkablePosition());
      this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkablePosition());
    }

    Game.Message.sendMessage("Find Evan Williams!");
  },
  setupMap: function(map) {
    this.setMap(new Game.Map(map));
    this.getMap().initializeTimingEngine();
    this.attr._prevX = this.getAvatar().getX();
    this.attr._prevY = this.getAvatar().getY();
    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkablePosition());
    this.setCameraToAvatar();

    if (map == 'forrest') {
      if (this.attr._drunk) {
        Game.UIMode.LAYER_textReading.setText(Game.getStoryForrestDK());
        Game.addUIMode('LAYER_textReading');
      } else {
        Game.UIMode.LAYER_textReading.setText(Game.getStoryForrestND());
        Game.addUIMode('LAYER_textReading');
      }
      this.getMap().addEntity(Game.EntityGenerator.create('Magical Herb'),this.getMap().getRandomReachablePosition());
      for (var ecount = 0; ecount < 25; ecount++)
        this.getMap().addEntity(Game.EntityGenerator.create('angry squirrel'),this.getMap().getRandomWalkablePosition());
    } else if(map == 'dungeon') {
      if (this.attr._trippy) {
        Game.UIMode.LAYER_textReading.setText(Game.getStoryDungeonHH());
        Game.addUIMode('LAYER_textReading');
      } else {
        Game.UIMode.LAYER_textReading.setText(Game.getStoryDungeonNH());
        Game.addUIMode('LAYER_textReading');
      }
      for (var ecount = 0; ecount < 25; ecount++)
        this.getMap().addEntity(Game.EntityGenerator.create('attack slug'),this.getMap().getRandomWalkablePosition());
      this.getMap().addEntity(Game.EntityGenerator.create('Evan Williams'),this.getMap().getRandomReachablePosition());
    } else if (map == 'castle') {
      Game.UIMode.LAYER_textReading.setText(Game.getStoryCastle());
      Game.addUIMode('LAYER_textReading');
      for(var ecount = 0; ecount < 10; ecount++)
        this.getMap().addEntity(Game.EntityGenerator.create('security'),this.getMap().getRandomReachablePosition());
      this.getMap().addEntity(Game.EntityGenerator.create('Castle Exit'),{ x:this.getAvatar().getX(),y: this.getAvatar().getY() + 1});
    }

    for (var ecount = 0; ecount < 50; ecount++) {
      this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkablePosition());
      this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkablePosition());
      this.getMap().addEntity(Game.EntityGenerator.create('dog'),this.getMap().getRandomWalkablePosition());
    }

    Game.renderMain();
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gamePlayStore = {
  attr: {
    _mapId:'',
    _cameraX: 10,
    _cameraY: 10,
    _avatarId: '',
    _merchantId: '',
    _input: 0,
    _prevX: 0,
    _prevY: 0,
    _bumped: false
  },
  JSON_KEY: 'UIMode_gamePlayStore',
  enter: function() {
    Game.Message.clearMessage();
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
  getMerchant: function() {
    return Game.DATASTORE.ENTITY[this.attr._merchantId];
  },
  setMerchant: function(m) {
    this.attr._merchantId = m.getId();
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
    } else if (actionBinding.actionKey == 'CANCEL') {
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
    Game.UIMode.gamePlay.setAvatar(this.getAvatar());
    Game.UIMode.gamePlay.getMap().addEntity(Game.UIMode.gamePlay.getAvatar(),{x:this.attr._prevX,y:this.attr._prevY});
    Game.UIMode.gamePlay.setCameraToAvatar();
    Game.switchUIMode('gamePlay');
  },
  renderOnMain: function(display) {
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      this.getMap().renderAll(display,this.attr._cameraX,this.attr._cameraY);
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
      return true;
    }
    return false;
  },
  setupStore: function(map) {
    this.setMap(new Game.Map(map));
    this.getMap().initializeTimingEngine();
    this.setAvatar(Game.UIMode.gamePlay.getAvatar());
    this.attr._prevX = this.getAvatar().getX();
    this.attr._prevY = this.getAvatar().getY();
    this.getMap().addEntity(this.getAvatar(),{x: 10, y: 11});
    var merch = '';
    if (map == 'theRedHeeringa') {
      merch = Game.EntityGenerator.create('Brent');
      this.getMap().addEntity(merch,{x: 10, y: 2});
      merch.addInventoryItems([Game.ItemGenerator.create('Keystone'), Game.ItemGenerator.create('Coke-a Nola'), Game.ItemGenerator.create('Lemon-Ice Tea'), Game.ItemGenerator.create('Red Kenny Supreme'), Game.ItemGenerator.create('BrewDog Beer')]);
      this.getMap().addEntity(Game.EntityGenerator.create('Harold'),{x: 3, y: 4});
      if(Game.UIMode.gamePlay.attr._drunk){
        this.getMap().addEntity(Game.EntityGenerator.create('Evan'),{x: 17, y: 6});
      }
    } else if (map == 'shopAndStop') {
      merch = Game.EntityGenerator.create('Nola');
      this.getMap().addEntity(merch,{x: 5, y: 2});
      merch.addInventoryItems([Game.ItemGenerator.create('apple'), Game.ItemGenerator.create('Bagel Bite'), Game.ItemGenerator.create('Curry and Rice')]);
      this.getMap().addEntity(Game.EntityGenerator.create('Alexis'),this.getMap().getRandomWalkablePosition());
    } else if (map == 'bedRoom') {
      Game.UIMode.LAYER_textReading.setText(Game.getStoryHome());
      Game.addUIMode('LAYER_textReading');
      merch = Game.EntityGenerator.create('Jose');
      this.setCameraToHeeringa();
      this.getMap().addEntity(this.getAvatar(),{x: 4, y: 1});
      this.getMap().addEntity(merch,{x: 3, y: 4});
    }
    this.setMerchant(merch);
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
    this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
  },
  setCameraToHeeringa: function () {
    this.setCamera(this.getMap().getWidth()/2,this.getMap().getHeight()/2);
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
      this.moveAvatar(0, -1);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_L') {
      this.moveAvatar(-1, 0);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_WAIT') {
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_R') {
      this.moveAvatar(1, 0);
      this.attr._input++;
    } else if (actionBinding.actionKey == 'MOVE_D') {
      this.moveAvatar(0, 1);
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
    } else if (actionBinding.actionKey == 'HELP') {
      // console.log('TODO: set up help stuff for gameplay');
      Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
      Game.addUIMode('LAYER_textReading');
    }

    if(this.attr._input >= 400){
      this.returnToTown()
      Game.Message.sendMessage('Ran out of inputs');
    }
    this.getAvatar().raiseSymbolActiveEvent('actionDone');
    Game.Message.ageMessages();

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
    this.getMap().addEntity(Game.EntityGenerator.create('noodles'),this.getMap().getRandomWalkablePosition());
    Game.Message.sendMessage('Try to pick up the cup noodle!');
    Game.Message.ageMessages();
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
  exit: function() {},
  handleInput: function(eventType,evt) {
    if (eventType == 'keypress' && evt.keyCode == 61) {
      Game.switchUIMode('gameStart');
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
      Game.switchUIMode('gameStart');
    }
  },
  renderOnMain: function(display) {
    Game.Message.sendMessage("Press '=' To Start A New Game");
    display.drawText(4,4,Game.UIMode.DEFAULT_COLOR_STR+"OHHHHH BABY! You win!");
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
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
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
  this._willBuy = template.willBuy || false;
  this._currentItem = template.currentItem || null;
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
  Game.Message.clearMessage();
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
    caption: 'Tony\'s Items',
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
            Game.removeUIModeAllLayers();
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
            Game.removeUIModeAllLayers();
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
        var d = Game.DATASTORE.ITEM[selectedItemIds[0]].getDetailedDescription() + + ".\nType [b] to buy an item or [x] to examine another item. Press [esc] to quit shopping.";
        setTimeout(function() { // delay here because of the general refresh on exiting the layer
           Game.specialMessage(d);
        }, 2);
      }
      Game.removeUIModeCurLayer();
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
        Game.getAvatar().eatFood(foodItem);
        Game.removeUIModeAllLayers();
        return true;
      }
      Game.removeUIModeAllLayers();
      return false;
    }
});
Game.UIMode.LAYER_inventoryEat.doSetup = function () {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIds()});
};

//-------------------

Game.UIMode.LAYER_sellerListing = new Game.UIMode.LAYER_itemListing({
    caption: 'Main Menu:',
    canSelect: false,
    keyBindingName: 'LAYER_sellerListing'
});
Game.UIMode.LAYER_sellerListing.doSetup = function () {
  Game.Message.clearMessage();
  Game.Message.sendMessage('Type [b] to buy an item or [x] to examine an item. Press [esc] to quit shopping.');
  this.setup({itemIdList: Game.getMerchant().getInventoryItemIds()});
};

Game.UIMode.LAYER_sellerListing.handleInput = function (inputType,inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);

  if (actionBinding) {
    if (actionBinding.actionKey == 'EXAMINE') {
      Game.addUIMode('LAYER_sellerExamine');
      return false;
    }
    if (actionBinding.actionKey == 'BUY') {
      Game.addUIMode('LAYER_sellerBuy');
      return false;
    }
  }
  return Game.UIMode.LAYER_itemListing.prototype.handleInput.call(this,inputType,inputData);
};

//-------------------

Game.UIMode.LAYER_sellerBuy = new Game.UIMode.LAYER_itemListing({
    caption: 'Buy',
    canSelect: true,
    canSelectMultipleItems: false,
    keyBindingName: 'LAYER_sellerBuy',
    processingFunction: function (selectedItemIds) {
      if (selectedItemIds[0]) {
        var itemToBuy = Game.DATASTORE.ITEM[selectedItemIds[0]];
        var itemValue = itemToBuy.getGoldValue();
        var avatar = Game.UIMode.gamePlayStore.getAvatar();
        if (avatar.canAfford(itemValue)) {
          avatar.raiseSymbolActiveEvent('aboutToBuy', {item: itemToBuy, value: itemValue});
          this._currentItem = itemToBuy;
          this._willBuy = true;
          //avatar.addInventoryItems([itemToBuy]);
          //Game.getMerchant().extractInventoryItems([selectedItemIds[0]])[0];
        } else avatar.raiseSymbolActiveEvent('cantAfford');
//        Game.util.cdebug(foodItem);
        return true;
      }
      return false;
    }
});
Game.UIMode.LAYER_sellerBuy.doSetup = function () {
  Game.Message.sendMessage('Type the letter of the item you want to buy. Type [esc] to return to main menu.');
  this.setup({itemIdList: Game.getMerchant().getInventoryItemIds()});
};
Game.UIMode.LAYER_sellerBuy.handleInput = function (inputType,inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
  var avatar = Game.UIMode.gamePlayStore.getAvatar();
  if (actionBinding) {
    if (this._willBuy) {
      if (actionBinding.actionKey == 'ANSWER_YES') {
        avatar.addInventoryItems([this._currentItem]);
        avatar.raiseSymbolActiveEvent('spendMoney',{amount: this._currentItem.getGoldValue()});
        Game.removeUIModeCurLayer();
        Game.Message.sendMessage('You bought a ' + this._currentItem.getName() + ' for ' + this._currentItem.getGoldValue() +' gold. You have ' + avatar.getCurrentMoney() + ' gold left. \n Type [b] to buy another item or [x] to examine an item. Press [esc] to quit shopping.');
        this._currentItem = null;
        this._willBuy = false;
      } else if (actionBinding.actionKey == 'ANSWER_NO') {
        this._currentItem == null;
        this._willBuy = false;
        Game.removeUIModeCurLayer();
      } else Game.Message.sendMessage('Please type [y] for yes or [n] for no.')
      return;
    }
  }
  return Game.UIMode.LAYER_itemListing.prototype.handleInput.call(this,inputType,inputData);
};

//-------------------

Game.UIMode.LAYER_sellerExamine = new Game.UIMode.LAYER_itemListing({
    caption: 'Examine',
    canSelect: true,
    keyBindingName: 'LAYER_sellerExamine',
    processingFunction: function (selectedItemIds) {
      //console.log('LAYER_inventoryExamine processing on '+selectedItemIds[0]);
      if (selectedItemIds[0]) {
        var d = Game.DATASTORE.ITEM[selectedItemIds[0]].getDetailedDescription() + ".\nType [b] to buy an item or [x] to examine another item. Press [esc] to quit shopping.";
        setTimeout(function() { // delay here because of the general refresh on exiting the layer
           Game.specialMessage(d);
        }, 2);
      }
      Game.removeUIModeCurLayer();
      return false;
    }
});
Game.UIMode.LAYER_sellerExamine.doSetup = function () {
  Game.Message.sendMessage('Type the letter of the item you want to examine.')
  Game.Message.ageMessages();
  this.setup({itemIdList: Game.getMerchant().getInventoryItemIds()});
};
