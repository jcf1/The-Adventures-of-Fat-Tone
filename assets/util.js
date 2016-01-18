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
  positionClosestToAvatar: function (ent,map) {
    var xpos = ent.getX();
    var ypos = ent.getY();
    var avtpos = Game.UIMode.gamePlay.getAvatar().getPos();
    if((xpos > avtpos.x && ypos > avtpos.y) && map.getTile(xpos-1,ypos-1).isWalkable()) {
      xpos = -1;ypos= -1;
    } else if((xpos < avtpos.x && ypos < avtpos.y) && map.getTile(xpos+1,ypos+1).isWalkable()) {
      xpos = 1;ypos = 1;
    } else if((xpos > avtpos.x && ypos < avtpos.y) && map.getTile(xpos-1,ypos+1).isWalkable()) {
      xpos = -1;ypos = 1;
    } else if((xpos < avtpos.x && ypos > avtpos.y) && map.getTile(xpos+1,ypos-1).isWalkable()) {
      xpos = 1;ypos = -1;
    } else if((xpos > avtpos.x) && map.getTile(xpos-1,ypos).isWalkable()) {
      xpos = -1;ypos = 0;
    } else if((xpos < avtpos.x) && map.getTile(xpos+1,ypos).isWalkable()) {
      xpos = 1;ypos = 0;
    } else if((ypos < avtpos.y) && map.getTile(xpos,ypos+1).isWalkable()) {
      ypos = 1;xpos = 0;
    } else if((ypos > avtpos.y) && map.getTile(xpos,ypos-1).isWalkable()) {
      ypos = -1;xpos = 0;
    }
    return {x:xpos,y:ypos};
  }
};
