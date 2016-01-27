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
  storyLvl: 'normal',
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
    //console.log("using random seed "+this._randomSeed);
    //this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
    //ROT.RNG.setSeed(this._randomSeed);
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
  },
  getStoryBeginning: function() {
    var story = "After a long, gruelling day of coding, Tony decides to go off on an adventure and wanders into town. ";
    story += "However, not long after he arrives he receives a frantic text! It says:\n\n";
    story += "\"Heeelp!!! Get Me Out Of Hereeeeeee! ~ Your Friend, Evan Williams.\"\n\n";
    story += "Reading the message, Tony begins to stress out! He isn't sure where Evan Williams is or how ot get to him!\n\n";
    story += "\"I know,\" thinks Tony, \"I bet he went into the forrest to get some more of that magical herb! Oh yeah that stuff was great!\"\n\n";
    story += "He stops to think a little more. \"Or he just got lost in that Dungeon again... What was it called... Saw-der, Saw-jer, Saw-errr..., SAWYER! Well better go check those places out!\"\n\n....";
    story += "\n\n\"Who knows, maybe I'll find that mystical new CS building we\'ve been promised.\"\n\n\n TIP: Kill mobs and buy food before leaving town to avoid starving.";
    return story;
  },
  getStoryCross: function() {
    var story = "After finding Evan Williams and consuming the Magical Herb, all of Tony's worries have been completely forgotten. In fact, he isn't completely sure where he is. ";
    story += "Walking around town, however, he sees a mysterious castle off in the distance.\n\n";
    story += "\"Hey,\" thinks Tony, \"I bet the president lives there.... I should get his autograph and get him to build that CS building. Let\'s go check it out!\"\n\n";
    story += "And so Tony makes his way North in hopes of convincing the president to make a new lab space!";
      return story;
  },
  getStoryDrunkNH: function() {
    var story = "Having defeated Evan Williams in 10 straight games of beer pong, Tony has begun to lose track of time and his memory isn't doing so good either. Still he doesn't want his night to end just yet, and he does remember one very important thing!\n\n";
    story += "\"OHH BABY! I need some of that Magical Herb stuff now!\" Tony screams, \"Where did Evan find it again??... Oh yeah!! To the Forrest!\"\n\n";
    story += "And so off he went.";
      return story;
  },
  getStoryHighND: function() {
    var story = "Tony has searched everywhere in the Forrest, but Evan is nowhere to be found. Still, after finding Magical Herb, nothing can bring him down.\n\n";
    story += "\"Well guess it's time to go look in that Dungeon,\" Tony whispers melodramatically. \"Now if only all those walls would stop chaning colors....\"\n\n\n \"I'M HUNGGRRYYY!!!! FOOODD!!!!!!!!!!";
      return story;
  },
  getStoryGoHome: function(said) {
    var story = ""
    if (said) story += "Tony, in a moment of enlightment, decided not listen to the little voice inside his head telling him to stay and escaped the castle, anyways. \n\n"
    story += "Having escaped securities' clutches, a newly sobered Tony has decided that he should probably head home for the night.\n\n  (Head South)";
    return story;
  },
  getStoryHome: function() {
    var story = "\"OHHH BABY! HOME SWEET HOME! TIME TO SLEEP!\" Tony yells as he gets into bed. \"Oh Man, ain't nothing going to stop me from sleeping!\"\n\n *SNORE* .... *SNORE*\n\n";
    story += "\"OHHH $#I7! WTF WAS THAT!!!!\" Tony looks around frantically looking for where the sound is coming from. \"OHHHH NO! Jose's asleep again! Well better get him to stop snoring!\"\n\n";
    story += "And so Tony gets out of bed for one last adventure! \n\n (Walk into Jose to win!)";
      return story;
  },
  getStoryForrestND: function() {
    var story = "Tony begins his search for Evan in the Forrest. However, in his rush Tony has forgotten where the entrance is!\n\n"
    story += "\"It's ok,\" Tony whispers, \"All I got to do is find where the Magical Herb grows. That's where I bet Evan is, and I can totally find my way out from there.\"\n\n"
    story += "And so, with nowhere left to go, Tony continues further, hoping to find Evan and the Magical Herb before it is too late.";
    return story;
  },
  getStoryForrestDK: function() {
    var story = "OHH MAN! TIME TO FIND THAT HERB!";
    return story;
  },
  getStoryDungeonNH: function() {
    var story = "Tony begins his search for Evan in the Dungeon. However, in his rush Tony has forgotten where the entrace is!\n\n";
    story += "\"It's ok,\" Tony whispers, \"Just gotta remember where I've been and I'll find my way out again. Just gotta find Evan first!\"\n\n"
    story += "And so, with nowhere left to go, Tony continues further, hoping to find Evan before it is too late."
    return story;
  },
  getStoryDungeonHH: function() {
    var story = "OHHH BABY! THESE COLORS ARE AWESOME! OK, OK. GOTTA FIND EVAN... AND FOOD... BUT FIRST EVAN... AND FOOD! SOOO HUNGGRRRYYY!!!";
    return story;
  },
  getStoryCastle: function() {
    var story = "Tony has gotten himself lost, AGAIN! Worse yet, security seems to be wandering around the castle looking for people. Get Tony out of the castle before he get's himself caught!";
    return story;
  }
};
