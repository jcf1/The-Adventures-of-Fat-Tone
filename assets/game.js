console.log("hello console");

window.onload = function() {
    console.log("starting WSRL - window loaded");
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

        var bindEventToScreen = function(eventType) {
            window.addEventListener(eventType, function(evt) {
              Game.eventHandler(eventType, evt);
            });
        };
        // Bind keyboard input events
        bindEventToScreen('keypress');
        bindEventToScreen('keydown');
//        bindEventToScreen('keyup');

        Game.switchUIMode(Game.UIMode.gameStart);
    }
};

var Game = {
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
  _currUIMode: null,
  init: function() {
    console.log("WSRL Live initialization");
    //this.DISPLAYS.main.o = new ROT.Display({width:this.DISPLAYS.main.w, height:this.DISPLAYS.main.h});
    for (var displayName in this.DISPLAYS) {
      if(this.DISPLAYS.hasOwnProperty(displayName)) {
        this.DISPLAYS[displayName].o = new ROT.Display({width:this.DISPLAYS[displayName].w, height:this.DISPLAYS[displayName].h});
      }
    }
    this.renderAll();
  },
  getDisplay: function(displayName) {
    return this.DISPLAYS[displayName].o;
  },
  renderAll: function() {
    this.renderAvatar();
    this.renderMain();
    this.renderMessage();
  },
  renderMain: function() {
    this.DISPLAYS.main.o.clear();
    if(this._currUIMode != null && this._currUIMode.hasOwnProperty("renderOnMain")){
      this._currUIMode.renderOnMain(this.DISPLAYS.main.o);
    } else {
      this.DISPLAYS.main.o.drawText(2,1,"main display")
    }
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if(this._currUIMode != null && this._currUIMode.hasOwnProperty("renderOnAvatar")){
      this._currUIMode.renderOnAvatar(this.DISPLAYS.avatar.o);
    } else {
      this.DISPLAYS.avatar.o.drawText(2,1,"avatar display")
    }
  },
  renderMessage: function() {
    Game.Message.renderOn(this.DISPLAYS.message.o);
  },
  switchUIMode: function (newMode) {
    if(this._currUIMode != null) {
        this._currUIMode.exit();
    }
    this._currUIMode = newMode;
    if(this._currUIMode != null) {
        this._currUIMode.enter();
    }
    this.renderAll();
  },
  eventHandler: function(eventType, evt) {
    console.log(eventType);
    console.dir(evt);
    if(this._currUIMode != null && this._currUIMode.hasOwnProperty("handleInput")){
      this._currUIMode.handleInput(eventType,evt);
    }
  }
};
