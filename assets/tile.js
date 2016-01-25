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

Game.Tile.nullTile = new Game.Tile({name:'nullTile', chr:'#'});
Game.Tile.floorTile = new Game.Tile({name:'floor',chr:' ',walkable:true,transparent:true});
Game.Tile.trippyFloorTile = new Game.Tile({name:'trippy floor',chr:'.',walkable:true,transparent:true});
Game.Tile.wallTile = new Game.Tile({name:'wall',chr:'#'});
Game.Tile.woodTile = new Game.Tile({name:'wood',chr:'#',fg: '#670A0A',transparent:true});
Game.Tile.heeringaDoorTile = new Game.Tile({name:'The Red Heeringa',chr:'-',fg:'#cc3300',transparent:true});
Game.Tile.invisibleTile = new Game.Tile({name:'invisible wall',chr:' ',transparent:true});
Game.Tile.lockedDoorTile = new Game.Tile({name:'locked door',chr:'='});
Game.Tile.mirrorDoorTile = new Game.Tile({name:'Hall of Mirrors',chr: '-', transparent:true});
Game.Tile.hTile = new Game.Tile({name:'H',chr:'H',transparent:true});
Game.Tile.eTile = new Game.Tile({name:'E',chr:'E',transparent:true});
Game.Tile.rTile = new Game.Tile({name:'R',chr:'R',transparent:true});
Game.Tile.tTile = new Game.Tile({name:'T',chr:'T',transparent:true});
Game.Tile.iTile = new Game.Tile({name:'I',chr:'I',transparent:true});
Game.Tile.nTile = new Game.Tile({name:'N',chr:'N',transparent:true});
Game.Tile.gTile = new Game.Tile({name:'G',chr:'G',transparent:true});
Game.Tile.dTile = new Game.Tile({name:'D',chr:'D',transparent:true});
Game.Tile.aTile = new Game.Tile({name:'A',chr:'A',transparent:true});
Game.Tile.oTile = new Game.Tile({name:'o',chr:'o',transparent:true});
Game.Tile.mTile = new Game.Tile({name:'M',chr:'M',transparent:true});
Game.Tile.toDungeonTile = new Game.Tile({name:'Dungeon',chr:'⭅',fg: '#CD8500',transparent:true});
Game.Tile.toForrestTile = new Game.Tile({name:'Forrest',chr:'⭆',fg: '#008B45',transparent:true});
Game.Tile.toCastleTile = new Game.Tile({name:'Castle',chr:'🏰',fg: '#008B45',transparent:true})
