Game.Tile = function (properties) {
  properties = properties || {};
  Game.Symbol.call(this, properties);
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._name = properties.name || 'unknown';
  this.attr._walkable = properties.walkable||false;
  this.attr._diggable = properties.diggable||false;
  this.attr._transparent = properties.transparent || false;
  this.attr._opaque = (properties.opaque !== undefined) ? properties.opaque : (! this.attr._transparent);
  this.attr._transparent = ! this.attr._opaque;
};
Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function () {
  return this.attr._name;
};
Game.Tile.prototype.isWalkable = function () {
  return this.attr._walkable;
};
Game.Tile.prototype.isDiggable = function () {
  return this.attr._diggable;
};
Game.Tile.prototype.isOpaque = function () {
  return this.attr._opaque;
};
Game.Tile.prototype.isTransparent = function () {
  return this.attr._transparent;
};

//-----------------------------------------------------------------------------

// All the various tiles used in the game
Game.Tile.nullTile = new Game.Tile({name:'nullTile', chr:'#'});
Game.Tile.floorTile = new Game.Tile({name:'floor',chr:' ',walkable:true,transparent:true});
Game.Tile.roadTile = new Game.Tile({name:'road',chr:'\u2591',fg: '#FEE8D6',walkable:true,transparent:true});
Game.Tile.trippyFloorTile = new Game.Tile({name:'trippy floor',chr:'.',walkable:true,transparent:true});
Game.Tile.wallTile = new Game.Tile({name:'wall',chr:'#'});

Game.Tile.woodTile = new Game.Tile({name:'wood',chr:'#',fg: '#670A0A',transparent:true});
Game.Tile.treeTile = new Game.Tile({name:'tree',chr:'#',fg:'#266A2E',diggable:true});
Game.Tile.invisibleTile = new Game.Tile({name:'invisible wall',chr:' ',transparent:true});
Game.Tile.lockedDoorTile = new Game.Tile({name:'locked door',chr:'='});

Game.Tile.heeringaDoorTile = new Game.Tile({name:'The Red Heeringa',chr:'-',fg:'#cc3300',transparent:true});
Game.Tile.barTile = new Game.Tile({name:'bar counter',chr:'#',fg: '#670A0A'});
Game.Tile.talkBarTile = new Game.Tile({name:'talk bar',chr:'#',fg: '#670A0A'});
Game.Tile.barDoorTile = new Game.Tile({name:'Bar Door',chr: '=',fg: '#670A0A', transparent:true});
Game.Tile.HaroldTile = new Game.Tile({name:'Harold Tile', chr:' '})

Game.Tile.shopDoorTile = new Game.Tile({name:'Shop And Stop',chr:'-',fg:'#cc3300',transparent:true});
Game.Tile.shopTile = new Game.Tile({name:'shop counter',chr:'#',fg: '#670A0A'});
Game.Tile.shelfTile = new Game.Tile({name:'shelf',chr:'+',fg: '#670A0A'});
Game.Tile.talkShopTile = new Game.Tile({name:'talk shop',chr:'#',fg: '#670A0A'});

Game.Tile.mirrorDoorTile = new Game.Tile({name:'Hall of Mirrors',chr: '-', transparent:true});

//Alphabetical Tiles
Game.Tile.aTile = new Game.Tile({name:'A',chr:'A',transparent:true});
Game.Tile.dTile = new Game.Tile({name:'D',chr:'D',transparent:true});
Game.Tile.eTile = new Game.Tile({name:'E',chr:'E',transparent:true});
Game.Tile.fTile = new Game.Tile({name:'F',chr:'F',transparent:true});
Game.Tile.gTile = new Game.Tile({name:'G',chr:'G',transparent:true});
Game.Tile.hTile = new Game.Tile({name:'H',chr:'H',transparent:true});
Game.Tile.iTile = new Game.Tile({name:'I',chr:'I',transparent:true});
Game.Tile.lTile = new Game.Tile({name:'L',chr:'L',transparent:true});
Game.Tile.mTile = new Game.Tile({name:'M',chr:'M',transparent:true});
Game.Tile.nTile = new Game.Tile({name:'N',chr:'N',transparent:true});
Game.Tile.OTile = new Game.Tile({name:'O',chr:'O',transparent:true});
Game.Tile.oTile = new Game.Tile({name:'o',chr:'o',transparent:true});
Game.Tile.pTile = new Game.Tile({name:'P',chr:'P',transparent:true});
Game.Tile.rTile = new Game.Tile({name:'R',chr:'R',transparent:true});
Game.Tile.sTile = new Game.Tile({name:'S',chr:'S',transparent:true});
Game.Tile.tTile = new Game.Tile({name:'T',chr:'T',transparent:true});

// Tiles to leave the Main Town
Game.Tile.toDungeonTile = new Game.Tile({name:'Dungeon',chr:'⭅',fg: '#CD8500',transparent:true});
Game.Tile.toForrestTile = new Game.Tile({name:'Forrest',chr:'⭆',fg: '#008B45',transparent:true});
Game.Tile.toCastleTile = new Game.Tile({name:'Castle',chr:'⇪',fg: '#F87531',transparent:true})
Game.Tile.toBedTile = new Game.Tile({name:'Bedroom',chr:'🚪',fg: '#CD8500',transparent:true})
