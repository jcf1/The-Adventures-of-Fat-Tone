Game.Tile = function (properties) {
  properties = properties || {};
  Game.Symbol.call(this, properties);
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._name = properties.name || 'unknown';
  this.attr._walkable = properties.walkable||false;
  this.attr._diggable = properties.diggable||false;
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

//-----------------------------------------------------------------------------

Game.Tile.nullTile = new Game.Tile({name:'nullTile'});
Game.Tile.floorTile = new Game.Tile({name:'floor',chr:' ',walkable:true});
Game.Tile.trippyFloorTile = new Game.Tile({name:'trippy floor',chr:'.',walkable:true});
Game.Tile.wallTile = new Game.Tile({name:'wall',chr:'#'});
Game.Tile.woodTile = new Game.Tile({name:'wood',chr:'#',fg: '#670A0A'});
Game.Tile.doorTile = new Game.Tile({name:'door',chr:'-',fg:'#cc3300',walkable:true});
Game.Tile.invisibleTile = new Game.Tile({name:'invisible',chr:' '});
Game.Tile.lockedDoorTile = new Game.Tile({name:'locked door',chr:'='});
Game.Tile.mirrorDoorTile = new Game.Tile({name:'mirror door',chr: '-',fg:'#cc3300'});
