window.onload = function() {
  // console.log("starting WSRL - window loaded");
  // Check if rot.js can work on this browser
  if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported by your browser.");
  } else {
    // Initialize the game
    Game.init();

    // Add the containers to our HTML page
    document.getElementById('wsrl-avatar-display').appendChild(   Game.getDisplay('avatar').getContainer());
    document.getElementById('wsrl-main-display').appendChild(   Game.getDisplay('main').getContainer());
    document.getElementById('wsrl-message-display').appendChild(   Game.getDisplay('message').getContainer());

    Game.switchUIMode('gameStart');
  }
};

var Game = {
  _persistenceNamespace: 'wsrlgame',
  _DISPLAY_SPACING: 1.1,
  DISPLAYS: {
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    main: {
      w: 80,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },
  _game:null,
  _currUIMode: null,
  _uiModeNameStack: [],
  _randomSeed: 0,
  TRANSIENT_RNG: null,

  DATASTORE: {},
  DeadAvatar: null,

  init: function() {
    this._game = this;

    this.TRANSIENT_RNG = ROT.RNG.clone();
    Game.setRandomSeed(5 + Math.floor(this.TRANSIENT_RNG.getUniform()*100000));

    //this.DISPLAYS.main.o = new ROT.Display({width:this.DISPLAYS.main.w, height:this.DISPLAYS.main.h});
    for (var displayName in this.DISPLAYS) {
      if(this.DISPLAYS.hasOwnProperty(displayName)) {
        this.DISPLAYS[displayName].o = new ROT.Display({width:this.DISPLAYS[displayName].w, height:this.DISPLAYS[displayName].h});
      }
    }
    this.renderAll();

    var game = this;
    var bindEventToUIMode = function(event) {
        window.addEventListener(event, function(e) {
            // send the event to the ui mode if there is one
            if (game.getCurrUIMode() !== null) {
                game.getCurrUIMode().handleInput(event, e);
            }
        });
    };
    // Bind keyboard input events
    bindEventToUIMode('keypress');
    bindEventToUIMode('keydown');
//        bindEventToUIMode('keyup');
  },
  getRandomSeed: function() {
    return this._randomSeed;
  },
  setRandomSeed: function(s) {
    this._randomSeed = s;
    console.log("using random seed "+this._randomSeed);
    this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
    ROT.RNG.setSeed(this._randomSeed);
  },
  getDisplay: function(displayName) {
    if(this.DISPLAYS.hasOwnProperty(displayName)){
      return this.DISPLAYS[displayName].o;
    }
    return null;
  },
  getDisplayHeight: function (displayName) {
    if (this.DISPLAYS.hasOwnProperty(displayName)) {
      return this.DISPLAYS[displayName].h;
    }
    return null;
  },
  renderAll: function() {
    this.renderAvatar();
    this.renderMain();
    this.renderMessage();
  },
  renderMain: function() {
    this.DISPLAYS.main.o.clear();
    if(this.getCurrUIMode() !== null && ('renderOnMain' in this.getCurrUIMode())){
      this.getCurrUIMode().renderOnMain(this.DISPLAYS.main.o);
    } else {
      return;
    }
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if(this.getCurrUIMode() !== null && ('renderAvatarInfo' in this.getCurrUIMode())){
      this.getCurrUIMode().renderAvatarInfo(this.DISPLAYS.avatar.o);
    } else {
      return;
    }
  },
  renderMessage: function() {
    Game.Message.renderOn(this.DISPLAYS.message.o);
  },
  hideDisplayMessage: function() {
    this.DISPLAYS.message.o.clear();
  },
  specialMessage: function(msg) {
    this.DISPLAYS.message.o.clear();
    this.DISPLAYS.message.o.drawText(1,1,'%c{#fff}%b{#000}'+msg,79);
  },
  getCurrUIMode: function () {
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName) {
      return Game.UIMode[uiModeName];
    }
    return null;
  },
  switchUIMode: function (newUIModeName) {
    if (newUIModeName.startsWith('LAYER_')) {
      return;
    }
    var currMode = this.getCurrUIMode();
    if(currMode !== null) {
      currMode.exit();
    }
    this._uiModeNameStack[0] = newUIModeName;
    var newMode = Game.UIMode[newUIModeName];
    if (newMode) {
      newMode.enter();
    }
  },
  addUIMode: function (newUIModeLayerName) {
    if (! newUIModeLayerName.startsWith('LAYER_')) {
      console.log('addUIMode not possible for non-layer '+newUIModeLayerName);
      return;
    }
    this._uiModeNameStack.unshift(newUIModeLayerName);
    var newMode = Game.UIMode[newUIModeLayerName];
    if (newMode) {
      newMode.enter();
    }
  },
  removeUIMode: function () {
    var currMode = this.getCurrUIMode();
    if (currMode !== null) {
      currMode.exit();
    }
    this._uiModeNameStack.shift();
  },
  eventHandler: function(eventType, evt) {
    if(this.getCurrUIMode() !== null){
      this.getCurrUIMode().handleInput(eventType,evt);
    }
  },
  getAvatar: function () {
    return Game.UIMode.gamePlay.getAvatar();
  },
  getMerchant: function() {
    return Game.UIMode.gamePlayStore.getMerchant();
  },
  refresh: function() {
    this.renderAll();
  },
  getCurrUIModeName: function () {
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName) {
      return uiModeName;
    }
    return null;
  },
  removeUIModeAllLayers: function () {
    var curModeName = this.getCurrUIModeName();
    while ((curModeName !== null) && curModeName.startsWith('LAYER_')) {
      var curMode = this.getCurrUIMode();
      curMode.exit();
      this._uiModeNameStack.shift();
      curModeName = this.getCurrUIModeName();
    }
  },
  removeUIModeCurLayer: function () {
    var curModeName = this.getCurrUIModeName();
    if((curModeName != null) && curModeName.startsWith('LAYER_')) {
      var curMode = this.getCurrUIMode();
      curMode.exit();
      this._uiModeNameStack.shift();
      curModeName = this.getCurrUIModeName();
    }
  }
};
