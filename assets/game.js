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
        document.getElementById('wsrl-main-display').appendChild(   Game.getDisplay('main').getContainer());
    }
};

var Game = {
  DISPLAYS: {
    main: {
      w: 80,
      h: 24,
      o: null
    }
  },
  init: function() {
    console.log("WSRL Live initialization");
    this.DISPLAYS.main.o = new ROT.Display({width:this.DISPLAYS.main.w, height:this.DISPLAYS.main.h});
    this.renderMain();
  },
  getDisplay: function(displayName) {
    return this.DISPLAYS[displayName].o;
  },
  renderMain: function() {
    for (var i = 0; i < 5; i++) {
      this.DISPLAYS.main.o.drawText(2,3 + i,"@");
    }

  }
};
