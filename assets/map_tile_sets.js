Game.MapTileSets = {
  main_town: {
    _width: 60,
    _height: 35,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.wallTile);
      var generator = new ROT.Map.Arena(this._width,this._height);
      // run again then update map
      generator.create(function(x,y,v) {
        if (v === 0) {
          // Tiles to leave Town
          if (y >= 16 && y <= 18) {
            if (x == 58 && y == 17 ) mapTiles[x][y] = Game.Tile.toForrestTile;
            else if (x == 1 && y == 17 ) mapTiles[x][y] = Game.Tile.toDungeonTile;
            else if (x != 1 && x != 58 ) mapTiles[x][y] = Game.Tile.roadTile;
          }
          else if (x >= 29 && x <= 31) {
            if (x == 30 && y == 1) mapTiles[x][y] = Game.Tile.toCastleTile;
            else if ( y != 1 ) mapTiles[x][y] = Game.Tile.roadTile;
          }
          // Unique Tiles for the Shop
          else if (x == 23 && y == 14 ) mapTiles[x][y] = Game.Tile.shopDoorTile;
          else if (x == 22 && y == 14 ) mapTiles[x][y] = Game.Tile.shopDoorTile;
          else if (x == 19 && y == 11 ) mapTiles[x][y] = Game.Tile.sTile;
          else if (x == 20 && y == 11 ) mapTiles[x][y] = Game.Tile.hTile;
          else if (x == 21 && y == 11 ) mapTiles[x][y] = Game.Tile.OTile;
          else if (x == 22 && y == 11 ) mapTiles[x][y] = Game.Tile.pTile;
          else if (x == 24 && y == 11 ) mapTiles[x][y] = Game.Tile.aTile;
          else if (x == 25 && y == 11 ) mapTiles[x][y] = Game.Tile.nTile;
          else if (x == 26 && y == 11 ) mapTiles[x][y] = Game.Tile.dTile;
          else if (x == 21 && y == 12 ) mapTiles[x][y] = Game.Tile.sTile;
          else if (x == 22 && y == 12 ) mapTiles[x][y] = Game.Tile.tTile;
          else if (x == 23 && y == 12 ) mapTiles[x][y] = Game.Tile.OTile;
          else if (x == 24 && y == 12 ) mapTiles[x][y] = Game.Tile.pTile;

          // Unique Tiles for the Bar
          else if (x == 23 && y == 24 ) mapTiles[x][y] = Game.Tile.heeringaDoorTile;
          else if (x == 22 && y == 24 ) mapTiles[x][y] = Game.Tile.heeringaDoorTile;
          else if (x == 19 && y == 21 ) mapTiles[x][y] = Game.Tile.tTile;
          else if (x == 20 && y == 21 ) mapTiles[x][y] = Game.Tile.hTile;
          else if (x == 21 && y == 21 ) mapTiles[x][y] = Game.Tile.eTile;
          else if (x == 24 && y == 21 ) mapTiles[x][y] = Game.Tile.rTile;
          else if (x == 25 && y == 21 ) mapTiles[x][y] = Game.Tile.eTile;
          else if (x == 26 && y == 21 ) mapTiles[x][y] = Game.Tile.dTile;
          else if (x == 19 && y == 22 ) mapTiles[x][y] = Game.Tile.hTile;
          else if (x == 20 && y == 22 ) mapTiles[x][y] = Game.Tile.eTile;
          else if (x == 21 && y == 22 ) mapTiles[x][y] = Game.Tile.eTile;
          else if (x == 22 && y == 22 ) mapTiles[x][y] = Game.Tile.rTile;
          else if (x == 23 && y == 22 ) mapTiles[x][y] = Game.Tile.iTile;
          else if (x == 24 && y == 22 ) mapTiles[x][y] = Game.Tile.nTile;
          else if (x == 25 && y == 22 ) mapTiles[x][y] = Game.Tile.gTile;
          else if (x == 26 && y == 22 ) mapTiles[x][y] = Game.Tile.aTile;

          // Unique Tiles for Hall of Mirrors
          else if (x == 37 && y == 24 ) mapTiles[x][y] = Game.Tile.mirrorDoorTile;
          else if (x == 34 && y == 21 ) mapTiles[x][y] = Game.Tile.hTile;
          else if (x == 35 && y == 21 ) mapTiles[x][y] = Game.Tile.aTile;
          else if (x == 36 && y == 21 ) mapTiles[x][y] = Game.Tile.lTile;
          else if (x == 37 && y == 21 ) mapTiles[x][y] = Game.Tile.lTile;
          else if (x == 39 && y == 21 ) mapTiles[x][y] = Game.Tile.OTile;
          else if (x == 40 && y == 21 ) mapTiles[x][y] = Game.Tile.fTile;
          else if (x == 34 && y == 22 ) mapTiles[x][y] = Game.Tile.mTile;
          else if (x == 35 && y == 22 ) mapTiles[x][y] = Game.Tile.iTile;
          else if (x == 36 && y == 22 ) mapTiles[x][y] = Game.Tile.rTile;
          else if (x == 37 && y == 22 ) mapTiles[x][y] = Game.Tile.rTile;
          else if (x == 38 && y == 22 ) mapTiles[x][y] = Game.Tile.OTile;
          else if (x == 39 && y == 22 ) mapTiles[x][y] = Game.Tile.rTile;
          else if (x == 40 && y == 22 ) mapTiles[x][y] = Game.Tile.sTile;


          else if (x>=18 && x <=27){
            if(y>=10 && y<=14) {
              mapTiles[x][y] = Game.Tile.woodTile;
            } else if(y>=20 && y<=24) {
              mapTiles[x][y] = Game.Tile.woodTile;
            } else if(Game.UIMode.gamePlay.attr._trippy) {
              mapTiles[x][y] = Game.Tile.trippyFloorTile;
            } else {
              mapTiles[x][y] = Game.Tile.floorTile;
            }
          }
          else if(x>=33 && x <=41){
            if(y>=20 && y<=24) {
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
  forrest: {
    _width: 100,
    _height: 100,
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
          mapTiles[x][y] = Game.Tile.floorTile;
        } else {
          mapTiles[x][y] = Game.Tile.treeTile;
        }
      });

      return mapTiles;
    }
  },
  dungeon: {
    _width: 100,
    _height: 100,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.Digger(this._width,this._height);

        generator.create();
      //}

      // run again then update map
      generator.create(function(x,y,v) {
        if (v === 1) {
          mapTiles[x][y] = Game.Tile.wallTile;
        } else {
          mapTiles[x][y] = Game.Tile.floorTile;
        }
      });

      return mapTiles;
    }
  },
  castle: {
    _width: 150,
    _height: 250,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.Rogue(this._width,this._height);

      generator.create();

      // run again then update map
      generator.create(function(x,y,v) {
        if (v === 1) {
          mapTiles[x][y] = Game.Tile.wallTile;
        } else {
          mapTiles[x][y] = Game.Tile.floorTile;
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
  },

  theRedHeeringa: {
    _width: 20,
    _height: 13,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.Arena(this._width,this._height);
      generator.create(function(x,y,v) {
        if (v === 1){
          mapTiles[x][y] = Game.Tile.wallTile;
        } else {
          if (y==3) {
            if (x == 10) mapTiles[x][y] = Game.Tile.talkBarTile;
            else if (x == 14 || x == 15) mapTiles[x][y] = Game.Tile.barDoorTile;
            else mapTiles[x][y] = Game.Tile.barTile;
          } else if (y == 4) {
            if(x == 1 || x == 2) mapTiles[x][y] = Game.Tile.HaroldTile;
            else mapTiles[x][y] = Game.Tile.floorTile;
          } else mapTiles[x][y] = Game.Tile.floorTile;
        }
      });
      return mapTiles;
    }
  },
  shopAndStop: {
    _width: 20,
    _height: 14,
    getMapTiles: function () {
      var mapTiles = Game.util.init2DArray(this._width,this._height,Game.Tile.nullTile);
      var generator = new ROT.Map.Arena(this._width,this._height);
      generator.create(function(x,y,v) {
        if (v === 1){
          mapTiles[x][y] = Game.Tile.wallTile;
        } else {
          if (x == 13 && y >= 2 && y <= 6) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 13 && y >= 8 && y <= 12) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 14 && y >= 2 && y <= 6) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 14 && y >= 8 && y <= 12) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 16 && y >= 2 && y <= 6) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 16 && y >= 8 && y <= 12) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 17 && y >= 2 && y <= 6) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (x == 17 && y >= 8 && y <= 12) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 1 && x == 10) mapTiles[x][y] = Game.Tile.shopTile;
          else if (y == 2 && x == 10) mapTiles[x][y] = Game.Tile.shopTile;
          else if (y == 5 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 6 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 8 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 9 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 11 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 12 && x >= 2 && x < 10) mapTiles[x][y] = Game.Tile.shelfTile;
          else if (y == 3) {
            if (x == 5) mapTiles[x][y] = Game.Tile.talkShopTile;
            else if (x > 10) mapTiles[x][y] = Game.Tile.floorTile;
            else mapTiles[x][y] = Game.Tile.shopTile;
          }  else mapTiles[x][y] = Game.Tile.floorTile;
        }
      });
      return mapTiles;
    }
  }
};
