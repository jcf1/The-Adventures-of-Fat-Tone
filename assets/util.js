if (!String.prototype.startsWith) { // nabbed from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

Game.util = {

  randomString: function (len) {
    var charSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    var res='';
    for (var i=0; i<len; i++) {
        res += charSource.random();
    }
    return res;
  },

  ID_SEQUENCE: 0,

  uniqueId: function() {
     Game.util.ID_SEQUENCE++;
     return Date.now()+'-'+Game.util.ID_SEQUENCE+'-'+Game.util.randomString(24);
  },

  init2DArray: function (x,y,initVal) {
    var a = [];
    for (var xdim=0; xdim < x; xdim++) {
      a.push([]);
      for (var ydim=0; ydim < y; ydim++) {
        a[xdim].push(initVal);
      }
    }
    return a;
  },

  randomInt: function (min,max) {
      var range = max - min;
      var offset = Math.floor(ROT.RNG.getUniform()*(range+1));
      return offset + min;
  },

  randomColorTrippy: function() {
    var col = ROT.Color.randomize([128,128,128], [128,128,128]);
    return ROT.Color.toHex(col);
  },

  randomNolaFact: function() {
    switch (this.randomInt(0,5)) {
      case 0:
        return 'My love for Nola is more infectious than ebola.';
      case 1:
        return 'Nola is the world\'s best compiler.';
      case 2:
        return 'Nola is love, Nola is life.';
      case 3:
        return 'Got Nola?';
      case 4:
        return 'Nola loves strawberry yogurt.';
      case 5:
        return 'Nola did all the sound effects in Jurassic World';
    }
    return 'error';
  },

  randomRap: function() {
    switch (this.randomInt(0,6)) {
      case 0:
        return 'The only thing you can rap is my burrito.';
      case 1:
        return 'You\'re the snake without the rattle.';
      case 2:
        return 'You\'re the boat without the paddle.';
      case 3:
        return 'You\'re the duck without the waddle.';
      case 4:
        return 'You\'re the horse without the saddle.';
      case 5:
        return 'You\'re the ranch without the cattle.';
      case 6:
        return 'You\'re weak like seven days.';
    }
    return 'error';
  },

  positionsAdjacentTo: function (pos) {
    var adjPos = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx !== 0 && dy !== 0) {
          adjPos.push({x:pos.x+dx,y:pos.y+dy});
        }
      }
    }
    return adjPos;
  },
  getDisplayDim: function (display) {
    return {w:display._options.width, h:display._options.height};
  },
  cdebug: function (a) {
    if (typeof a == 'object') {
      console.dir(JSON.parse(JSON.stringify(a)));
    } else {
      console.log(a);
    }
  },

  objectArrayToIdArray: function (ar) {
    return ar.map(function (elt) {
      return elt.getId();
    });
  },

  compactBooleanArray_or: function (ar) {
    if (! ar) { return false; }
    var ret = false;
    for (var i = 0; i < ar.length; i++) {
      ret = ret || ar[i];
    }
    return ret;
  },
  compactBooleanArray_and: function (ar) {
    if (! ar) { return false; }
    var ret = true;
    for (var i = 0; i < ar.length; i++) {
      ret = ret && ar[i];
    }
    return ret;
  },

  compactNumberArray_add: function (ar) {
    if (! ar) { return 0; }
    var ret = 0;
    for (var i = 0; i < ar.length; i++) {
      ret += ar[i];
    }
    return ret;
  },
  compactNumberArray_mult: function (ar) {
    if (! ar) { return 1; }
    var ret = 1;
    for (var i = 0; i < ar.length; i++) {
      ret *= ar[i];
    }
    return ret;
  }
};
