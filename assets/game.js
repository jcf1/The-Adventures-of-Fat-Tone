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

    Game.switchUIMode(Game.UIMode.gameStart);
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
  _randomSeed: 0,
  TRANSIENT_RNG: null,

  DATASTORE: {},

  Scheduler: null,
  TimeEngine: null,

  init: function() {
    console.log("WSRL Live initialization");

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
    var bindEventToScreen = function(event) {
        window.addEventListener(event, function(e) {
            // When an event is received, send it to the
            // screen if there is one
            if (game._currUIMode !== null) {
                // Send the event type and data to the screen
                game._currUIMode.handleInput(event, e);
            }
        });
    };
    // Bind keyboard input events
    bindEventToScreen('keypress');
    bindEventToScreen('keydown');
//        bindEventToScreen('keyup');
  },

  initializeTimingEngine: function () {
    // NOTE: single, central timing system for now - might have to refactor this later to deal with mutliple map stuff
    Game.Scheduler = new ROT.Scheduler.Action();
    Game.TimeEngine = new ROT.Engine(Game.Scheduler);
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
  renderAll: function() {
    this.renderAvatar();
    this.renderMain();
    this.renderMessage();
  },
  renderMain: function() {
    this.DISPLAYS.main.o.clear();
    if(this._currUIMode !== null && this._currUIMode.hasOwnProperty("renderOnMain")){
      console.log("RENDER _CurrUIMode");
      this._currUIMode.renderOnMain(this.DISPLAYS.main.o);
    } else {
      return;
    }
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if(this._currUIMode !== null && this._currUIMode.hasOwnProperty("renderAvatarInfo")){
      this._currUIMode.renderAvatarInfo(this.DISPLAYS.avatar.o);
    } else {
      return;
    }
  },
  renderMessage: function() {
    Game.Message.renderOn(this.DISPLAYS.message.o);
  },
  switchUIMode: function (newMode) {
    if(this._currUIMode !== null) {
      this._currUIMode.exit();
    }
    this._currUIMode = newMode;
    console.log(this._currUIMode);
    if(this._currUIMode !== null) {
      this._currUIMode.enter();
    }
    this.renderAll();
  },
  eventHandler: function(eventType, evt) {
    //console.log(eventType);
    //console.dir(evt);
    if(this._currUIMode !== null){
      this._currUIMode.handleInput(eventType,evt);
    }
  },
  refresh: function() {
    this.renderAll();
  }
  // toJSON: function() {
  //   var json = {};
  //   json._randomSeed = this._randomSeed;
  //   json[Game.UIMode.gamePlay.JSON_KEY] = Game.UIMode.gamePlay.toJSON();
  //   return json;
  // },
};
