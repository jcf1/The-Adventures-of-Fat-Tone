Game.MapTileSets = {
  main_town: {
    _width: 50,
    _height: 50,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.wallTile);
      var generator = new ROT.Map.Arena(this._width,this._height);
      // run again then update map
      generator.create(function(x,y,v) {
        if (v === 0) {
          if (x == 48 && y == 25 ) mapTiles[x][y] = Game.Tile.toForrestTile;
          else if (x == 1 && y == 25 ) mapTiles[x][y] = Game.Tile.toDungeonTile;
          else if(x == 34 && y == 37 ) mapTiles[x][y] = Game.Tile.mirrorDoorTile;
          else if(x == 33 && y == 35 ) mapTiles[x][y] = Game.Tile.hTile;
          else if(x == 34 && y == 35 ) mapTiles[x][y] = Game.Tile.oTile;
          else if(x == 35 && y == 35 ) mapTiles[x][y] = Game.Tile.mTile;
          else if(x>=31 && x <=37){
            if(y>=34 && y<=37) {
              mapTiles[x][y] = Game.Tile.woodTile;
            } else if(Game.UIMode.gamePlay.attr._trippy) {
              mapTiles[x][y] = Game.Tile.trippyFloorTile;
            } else {
              mapTiles[x][y] = Game.Tile.floorTile;
            }
          } else if(Game.UIMode.gamePlay.attr._trippy) {
            mapTiles[x][y] = Game.Tile.trippyFloorTile;
          } else {
            mapTiles[x][y] = Game.Tile.floorTile;
          }
        } else {
          mapTiles[x][y] = Game.Tile.wallTile;
        }
      });

      return mapTiles;
    }
  },
  caves1: {
    _width: 300,
    _height: 200,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.Cellular(this._width,this._height);
      generator.randomize(0.54);

      // repeated cellular automata process
      var totalIterations = 3;
      for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
      }

      // run again then update map
      generator.create(function(x,y,v) {
        if (v === 1) {
          mapTiles[x][y] = Game.Tile.trippyFloorTile;
        } else {
          mapTiles[x][y] = Game.Tile.wallTile;
        }
      });

      return mapTiles;
    }
  },
  hallOfMirrors: {
    _width: 40,
    _height: 20,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.EllerMaze(this._width,this._height);
      generator.create(function(x,y,v) {
        if (v === 1){
          mapTiles[x][y] = Game.Tile.invisibleTile;
        } else mapTiles[x][y] = Game.Tile.floorTile;
      });
      return mapTiles;
    }
  }
};
