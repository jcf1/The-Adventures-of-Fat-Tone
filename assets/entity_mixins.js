Game.EntityMixin = {};

// Mixins have a META property is is info about/for the mixin itself and then all other properties. The META property is NOT copied into objects for which this mixin is used - all other properies ARE copied in.
Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
    listeners: {
      'walkForbidden': function(evtData) {
        var nameEvt = evtData.target.getName();
        if(nameEvt == 'Hall of Mirrors')
          Game.Message.sendMessage('Do you want to walk into the '+ nameEvt +' for 10 Gold? Type \'y\' for yes, \'n\' for no');
        else if(nameEvt == 'Dungeon' || nameEvt == 'Forrest' || nameEvt == 'Castle' || nameEvt == 'Shop And Stop')
          Game.Message.sendMessage('Do you want to walk into the '+ nameEvt +'? Type \'y\' for yes, \'n\' for no');
        else if (nameEvt == 'The Red Heeringa')
          Game.Message.sendMessage('Do you want to walk into '+ nameEvt +'? Type \'y\' for yes, \'n\' for no');
        else if (nameEvt == 'talk bar' || nameEvt == 'talk shop')
          if (nameEvt == 'talk shop') Game.Message.sendMessage('Hi my name is Nola! Do you want to see what is for sale? Type \'y\' for yes, \'n\' for no')
          else Game.Message.sendMessage('Do you want to see what is for sale? Type \'y\' for yes, \'n\' for no');
        // else Game.Message.sendMessage('You cannot walk into the ' + nameEvt);
        //   Game.renderMessage();
        //   Game.Message.ageMessages();
      },
      'attackAvoided': function(evtData) {
        Game.Message.sendMessage('you avoided the '+evtData.attacker.getName());
        Game.renderMessage();
        Game.Message.ageMessages(); // NOTE: maybe not do this? If surrounded by multiple attackers messages could be aged out before being seen...
      },
      'attackMissed': function(evtData) {
        Game.Message.sendMessage('you missed the '+evtData.recipient.getName());
        Game.renderMessage();
      },
      'dealtDamage': function(evtData) {
        Game.Message.sendMessage('you hit the '+evtData.damagee.getName()+' for '+evtData.damageAmount);
        Game.renderMessage();
      },
      'madeKill': function(evtData) {
        Game.Message.sendMessage('you killed the '+evtData.entKilled.getName());
        Game.renderMessage();
      },
      'damagedBy': function(evtData) {
        Game.Message.sendMessage('the '+evtData.damager.getName()+' hit you for '+evtData.damageAmount);
        Game.renderMessage();
        Game.Message.ageMessages();
      },
      'killed': function(evtData) {
        if (typeof evtData.killedBy == 'string') {
          Game.Message.sendMessage('you were killed by '+evtData.killedBy);
        } else {
          Game.Message.sendMessage('you were killed by the '+evtData.killedBy.getName());
        }
        Game.renderMessage();
        Game.Message.ageMessages();
      },
      'noItemsToPickup': function(evtData) {
        Game.Message.sendMessage('there is nothing to pickup');
        Game.renderMessage();
      },
      'inventoryFull': function(evtData) {
        Game.Message.sendMessage('your inventory is full');
        Game.renderMessage();
      },
      'inventoryEmpty': function(evtData) {
        Game.Message.sendMessage('you are not carrying anything');
        Game.renderMessage();
      },
      'noItemsPickedUp': function(evtData) {
        Game.Message.sendMessage('you could not pick up any items');
        Game.renderMessage();
      },
      'someItemsPickedUp': function(evtData) {
        Game.Message.sendMessage('you picked up '+evtData.numItemsPickedUp+' of the items, leaving '+evtData.numItemsNotPickedUp+' of them');
        Game.renderMessage();
      },
      'allItemsPickedUp': function(evtData) {
        if (evtData.numItemsPickedUp > 2) {
          Game.Message.sendMessage('you picked up all '+evtData.numItemsPickedUp+' items');
        } else if (evtData.numItemsPickedUp == 2) {
          Game.Message.sendMessage('you picked up both items');
        } else {
          Game.Message.sendMessage('you picked up the '+evtData.lastItemPickedUpName);
        }
        Game.renderMessage();
      },
      'itemsDropped': function(evtData) {
        if (evtData.numItemsDropped > 1) {
          Game.Message.sendMessage('you dropped '+evtData.numItemsDropped+' items');
        } else {
          Game.Message.sendMessage('you dropped the '+evtData.lastItemDroppedName);
        }
        Game.renderMessage();
      },
      'cantAfford': function(evtData){
        Game.Message.sendMessage('You don\'t have enough money to afford that');
        Game.renderMessage();
      },
      'pickUpMoney': function(evtData) {
        Game.Message.sendMessage('You picked up '+evtData.amount+' gold');
        Game.renderMessage();
      }
    }
  }
};

Game.EntityMixin.PlayerActor = {
  META: {
    mixinName: 'PlayerActor',
    mixinGroup: 'Actor',
    stateNamespace: '_PlayerActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000,
      bumpEvt: ''
    },
    init: function (template) {
      //this.getMap().attr._Scheduler.add(this,true,1);
    },
    listeners: {
      'createdEntity' : function() {
        this.getMap().attr._Scheduler.add(this,true,1);
      },
      'answeredQ' : function (ans) {
        Game.Message.ageMessages();
        if (ans == 'yes') {
          if (this.getBumpEvt() == 'Hall of Mirrors') {
            if (Game.UIMode.gamePlay.getAvatar().canAfford(10)) {
              Game.UIMode.gamePlay.getAvatar().raiseSymbolActiveEvent('spendMoney',{amount:10});
              Game.UIMode.gamePlayMirror.setupMirror();
              Game.switchUIMode('gamePlayMirror');
            } else Game.UIMode.gamePlay.getAvatar().raiseSymbolActiveEvent('spendMoney',{amount:10});
          }
          else if (this.getBumpEvt() == 'Forrest') {
            Game.UIMode.gamePlay.setupMap('forrest');
            Game.UIMode.gamePlay.removeAvatar();
          }
          else if (this.getBumpEvt() == 'Dungeon') {
            Game.UIMode.gamePlay.setupMap('dungeon');
            Game.UIMode.gamePlay.removeAvatar();
          }
          else if (this.getBumpEvt() == 'Castle') {
            Game.UIMode.gamePlay.setupMap('castle');
            Game.UIMode.gamePlay.removeAvatar();
          }
          else if (this.getBumpEvt() == 'The Red Heeringa') {
            Game.UIMode.gamePlayStore.setupStore('theRedHeeringa');
            Game.UIMode.gamePlay.removeAvatar();
            Game.switchUIMode('gamePlayStore');
          }
          else if (this.getBumpEvt() == 'Shop And Stop') {
            Game.UIMode.gamePlayStore.setupStore('shopAndStop');
            Game.UIMode.gamePlay.removeAvatar();
            Game.switchUIMode('gamePlayStore');
          }
          else if (this.getBumpEvt() == 'talk bar' || this.getBumpEvt() == 'talk shop') {
            Game.addUIMode('LAYER_sellerListing');
            Game.UIMode.gamePlayStore.setBumped(false);
          }
          Game.UIMode.gamePlay.setBumped(false);
        } else if (ans == 'no answer') {
          Game.Message.sendMessage('Please answer yes [y] or no [n]');
        } else if (this.getBumpEvt() == 'talk bar' || this.getBumpEvt() == 'talk shop'){
          Game.UIMode.gamePlayStore.setBumped(false);
          Game.Message.sendMessage('You will regret not buying from me!')
        } else {
          Game.UIMode.gamePlay.setBumped(false);
          Game.Message.sendMessage('You chose not to enter the ' +this.getBumpEvt() + '. YOU COWARD!');
        }
        Game.Message.ageMessages();
      },
      'walkForbidden' : function(evtData) {
        var nameEvt = evtData.target.getName();
        if(nameEvt == 'Hall of Mirrors' || nameEvt == 'Dungeon' || nameEvt == 'Forrest' || nameEvt == 'Castle' || nameEvt == 'The Red Heeringa' || nameEvt == 'Shop And Stop'){
          Game.UIMode.gamePlay.setBumped(true);
          this.setBumpEvt(nameEvt);
        } else if (nameEvt == 'talk bar' || nameEvt == 'talk shop') {
          Game.UIMode.gamePlayStore.setBumped(true);
          this.setBumpEvt(nameEvt);
        } else if (nameEvt == 'Harold Tile') {
          Game.Message.sendMessage(Game.util.randomRap());
          Game.Message.ageMessages();
        }
      },
      'actionDone': function(evtData) {
        this.getMap().attr._Scheduler.setDuration(this.getCurrentActionDuration());
        this.raiseSymbolActiveEvent('getHungrier',{duration:this.getCurrentActionDuration()});
        this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-5,5));
        var timeEngine = this.getMap().attr._TimeEngine;
        setTimeout(function() {timeEngine.unlock();},1); // NOTE: this tiny delay ensures console output happens in the right order, which in turn means I have confidence in the turn-taking order of the various entities
        Game.renderMessage();
        // console.log("end player acting");
      },
      'bumpEntity': function(evtData) {
        //console.log('MeleeAttacker bumpEntity');
        if (evtData.recipient.getName() == 'Evan Williams' || evtData.recipient.getName() == 'Magical Herb') {
          if(Game.UIMode.gamePlay.attr._trippy)
            Game.UIMode.gamePlay.attr._trippy = false;
          else
            Game.UIMode.gamePlay.attr._trippy = true;
        }
        if (evtData.recipient.getName() == 'Alexis') {
          Game.Message.sendMessage(Game.util.randomNolaFact());
        }
        if (evtData.recipient.getName() == 'Harold') {
          Game.Message.sendMessage(Game.util.randomRap());
        }
      },
      'madeKill': function(evtData) {
        var self = this;
        setTimeout(function() {
          var victoryCheckResp = self.raiseSymbolActiveEvent('calcKillsOf',{entityName:'attack slug'});
          if (Game.util.compactNumberArray_add(victoryCheckResp.killCount) >= 3) {
          Game.switchUIMode("gameWin");
          }
        },1);
      },
      'killed': function(evtData) {
      //this.getMap().attr._TimeEngine.lock();
      Game.DeadAvatar = this;
      Game.switchUIMode("gameLose");
      }
    }
  },
  getBumpEvt: function () {
    return this.attr._PlayerActor_attr.bumpEvt;
  },
  setBumpEvt: function (n) {
    this.attr._PlayerActor_attr.bumpEvt = n;
  },
  getBaseActionDuration: function () {
    return this.attr._PlayerActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._PlayerActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._PlayerActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._PlayerActor_attr.currentActionDuration = n;
  },
  isActing: function (state) {
    if (state !== undefined) {
      this.attr._PlayerActor_attr.actingState = state;
    }
    return this.attr._PlayerActor_attr.actingState;
  },
  act: function () {
    // console.log("begin player acting");
    // console.log("player pre-lock engine lock state is "+this.getMap().attr._TimeEngine._lock);
    if (this.isActing()) { return; } // a gate to deal with JS timing issues
    this.isActing(true);
    Game.refresh();
    Game.renderMain();
    Game.renderAvatar();
    this.getMap().attr._TimeEngine.lock();
    // console.log("player post-lock engine lock state is "+this.getMap().attr._TimeEngine._lock);
    this.isActing(false);
  }
};

Game.EntityMixin.WalletHolder = {
  META: {
    mixinName: 'WalletHolder',
    mixinGroup: 'WalletHolder',
    stateNamespace: '_WalletHolder_attr',
    stateModel:  {
      currentMoney: 0
    },
    init: function(template) {
      this.attr._WalletHolder_attr.currentMoney = template.currentMoney || 0;
    },
    listeners: {
      'dropMoney': function(evtData) {
        this.addMoney(evtData.dropAmount);
        this.raiseSymbolActiveEvent('pickUpMoney',{amount:evtData.dropAmount});
      },
      'spendMoney': function(evtData) {
        if(evtData.amount <= this.attr._WalletHolder_attr.currentMoney){
          this.subMoney(evtData.amount);
        } else {
          this.raiseSymbolActiveEvent('cantAfford');
        }
      }
    }
  },
  addMoney: function(n) {
    this.attr._WalletHolder_attr.currentMoney = this.attr._WalletHolder_attr.currentMoney + n;
  },
  subMoney: function(n) {
    this.attr._WalletHolder_attr.currentMoney = this.attr._WalletHolder_attr.currentMoney - n;
  },
  getCurrentMoney: function() {
    return this.attr._WalletHolder_attr.currentMoney;
  },
  canAfford: function(price) {
    return price <= this.attr._WalletHolder_attr.currentMoney;
  }
}

Game.EntityMixin.MoneyDropper = {
  META: {
    mixinName: 'MoneyDropper',
    mixinGroup: 'MoneyDropper',
    stateNamespace: '_MoneyDropper_attr',
    stateModel: {
      minDropAmount: 0,
      maxDropAmount: 0
    },
    init: function(template) {
      this.attr._MoneyDropper_attr.minDropAmount = template.minDropAmount || 0;
      this.attr._MoneyDropper_attr.maxDropAmount = template.maxDropAmount || 0;
    },
    listeners: {
      'killed': function(evtData) {
        var amount = Game.util.randomInt(this.attr._MoneyDropper_attr.minDropAmount,this.attr._MoneyDropper_attr.maxDropAmount);
        evtData.killedBy.raiseSymbolActiveEvent('dropMoney',{dropAmount:amount});
      }
    }
  }
}

Game.EntityMixin.FoodConsumer = {
  META: {
    mixinName: 'FoodConsumer',
    mixinGroup: 'FoodConsumer',
    stateNamespace: '_FoodConsumer_attr',
    stateModel:  {
      currentFood: 2000,
      maxFood: 2000,
      foodConsumedPer1000Ticks: 1
    },
    init: function (template) {
      this.attr._FoodConsumer_attr.maxFood = template.maxFood || 2000;
      this.attr._FoodConsumer_attr.currentFood = template.currentFood || (this.attr._FoodConsumer_attr.maxFood*0.9);
      this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks = template.foodConsumedPer1000Ticks || 1;
    },
    listeners: {
      'getHungrier': function(evtData) {
        this.getHungrierBy(this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks * evtData.duration/1000);
      }
    }
  },
  getMaxFood: function () {
    return this.attr._FoodConsumer_attr.maxFood;
  },
  setMaxFood: function (n) {
    this.attr._FoodConsumer_attr.maxFood = n;
  },
  getCurFood: function () {
    return this.attr._FoodConsumer_attr.currentFood;
  },
  setCurFood: function (n) {
    this.attr._FoodConsumer_attr.currentFood = n;
  },
  getFoodConsumedPer1000: function () {
    return this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks;
  },
  setFoodConsumedPer1000: function (n) {
    this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks = n;
  },
  eatFood: function (foodItm) {
    if (foodItm.hasMixin('Elixir')) {
      var boost = foodItm.getElixirBoost();
      if (boost == 'power') {
        this.raiseSymbolActiveEvent('raiseAttackDamage', 1);
      } else if (boost == 'accuracy') {
        this.raiseSymbolActiveEvent('raiseAttackHit', 1);
      } else if (boost == 'dodging') {
        this.raiseSymbolActiveEvent('raiseAttackAvoid', 1);
      } else if (boost == 'toughness') {
        this.raiseSymbolActiveEvent('raiseDamageMitigation', 1);
      } else if (boost == 'all') {
        this.raiseSymbolActiveEvent('raiseAttackDamage', 1)
        this.raiseSymbolActiveEvent('raiseAttackHit', 1);
        this.raiseSymbolActiveEvent('raiseAttackAvoid', 1);
        this.raiseSymbolActiveEvent('raiseDamageMitigation', 1);
      }
    }
    this.attr._FoodConsumer_attr.currentFood += foodItm.getFoodValue();
    if (this.attr._FoodConsumer_attr.currentFood > this.attr._FoodConsumer_attr.maxFood) {this.attr._FoodConsumer_attr.currentFood = this.attr._FoodConsumer_attr.maxFood;}
  },
  getHungrierBy: function (foodAmt) {
    //this.attr._FoodConsumer_attr.currentFood -= foodAmt;
    if (this.attr._FoodConsumer_attr.currentFood < 0) {
      this.raiseSymbolActiveEvent('killed',{killedBy: 'starvation'});
    }
  },
  getHungerStateDescr: function () {
    var frac = this.attr._FoodConsumer_attr.currentFood/this.attr._FoodConsumer_attr.maxFood;
    if (frac < 0.1) { return '%c{#ff2}%b{#f00}*STARVING*'; }
    if (frac < 0.25) { return '%c{#f00}%b{#dd0}starving'; }
    if (frac < 0.45) { return '%c{#fb0}%b{#540}hungry'; }
    if (frac < 0.65) { return '%c{#dd0}%b{#000}peckish'; }
    if (frac < 0.95) { return '%c{#090}%b{#000}full'; }
    return '%c{#090}%b{#320}*stuffed*';
  }
};


Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker',
    listeners: {
      'adjacentMove': function(evtData) {
          // console.log('listener adjacentMove');
          // console.dir(JSON.parse(JSON.stringify(evtData)));
          var map = this.getMap();
          var dx=evtData.dx,dy=evtData.dy;
          // var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth()-1);
          // var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight()-1);
          var targetX = this.getX() + dx;
          var targetY = this.getY() + dy;
          if ((targetX < 0) || (targetX >= map.getWidth()) || (targetY < 0) || (targetY >= map.getHeight())) {
            this.raiseSymbolActiveEvent('walkForbidden',{target:Game.Tile.nullTile});
            return {madeAdjacentMove:false};
          }

          if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
            this.raiseSymbolActiveEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
            // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
            return {madeAdjacentMove:true};
          }
          var targetTile = map.getTile(targetX,targetY);
          if (targetTile.isWalkable()) {
            this.setPos(targetX,targetY);
            var myMap = this.getMap();
            if (myMap) {
              myMap.updateEntityLocation(this);
            }
            return {madeAdjacentMove:true};
          } else {
            this.raiseSymbolActiveEvent('walkForbidden',{target:targetTile});
          }
          return {madeAdjacentMove:false};
      }
    }
  }
};


Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel:  {
      turnCounter: 0,
      killLog:{},
      deathMessage:'',
      killCount: 0
    },
    listeners: {
      'actionDone': function(evtData) {
        this.trackTurnCount();
      },
      'madeKill': function(evtData) {
        //console.log('chronicle kill');
        this.addKill(evtData.entKilled);
      },
      'killed': function(evtData) {
        if (typeof evtData.killedBy == 'string') {
          this.attr._Chronicle_attr.deathMessage = 'killed by '+evtData.killedBy;
        } else {
          this.attr._Chronicle_attr.deathMessage = 'killed by '+evtData.killedBy.getName();
        }
      },
      'calcKillsOf': function (evtData) {
        return {killCount:this.getKillsOf(evtData.entityName)};
      }
    }
  },
  trackTurnCount: function () {
    this.attr._Chronicle_attr.turnCounter++;
  },
  getTurns: function () {
    return this.attr._Chronicle_attr.turnCounter;
  },
  setTurns: function (n) {
    this.attr._Chronicle_attr.turnCounter = n;
  },
  getKills: function () {
    return this.attr._Chronicle_attr.killLog;
  },
  getKillsOf: function (entityName) {
    return this.attr._Chronicle_attr.killLog[entityName] || 0;
  },
  getTotalKills: function () {
    return this.attr._Chronicle_attr.killCount;
  },
  clearKills: function () {
    this.attr._Chronicle_attr.killLog = {};
  },
  addKill: function (entKilled) {
    var entName = entKilled.getName();
    //console.log('chronicle kill of '+entName);
    if (this.attr._Chronicle_attr.killLog[entName]) {
      this.attr._Chronicle_attr.killLog[entName]++;
    } else {
      this.attr._Chronicle_attr.killLog[entName] = 1;
    }
    this.attr._Chronicle_attr.killCount++;
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',
    stateModel:  {
      maxHp: 1,
      curHp: 1
    },
    init: function (template) {
      this.attr._HitPoints_attr.maxHp = template.maxHp || 1;
      this.attr._HitPoints_attr.curHp = template.curHp || this.attr._HitPoints_attr.maxHp;
    },
    listeners: {
      'attacked': function(evtData) {
        //console.log('HitPoints attacked');

        this.takeHits(evtData.attackDamage);
        this.raiseSymbolActiveEvent('damagedBy',{damager:evtData.attacker,damageAmount:evtData.attackDamage});
        evtData.attacker.raiseSymbolActiveEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackDamage});
        if (this.getCurHp() <= 0) {
          this.raiseSymbolActiveEvent('killed',{entKilled: this, killedBy: evtData.attacker});
          evtData.attacker.raiseSymbolActiveEvent('madeKill',{entKilled: this, killedBy: evtData.attacker});
        }
      },
      'killed': function(evtData) {
        this.destroy();
      }
    }
  },
  getMaxHp: function () {
    return this.attr._HitPoints_attr.maxHp;
  },
  setMaxHp: function (n) {
    this.attr._HitPoints_attr.maxHp = n;
  },
  getCurHp: function () {
    return this.attr._HitPoints_attr.curHp;
  },
  setCurHp: function (n) {
    this.attr._HitPoints_attr.curHp = n;
  },
  takeHits: function (amt) {
    this.attr._HitPoints_attr.curHp -= amt;
  },
  recoverHits: function (amt) {
    this.attr._HitPoints_attr.curHp = Math.min(this.attr._HitPoints_attr.curHp+amt,this.attr._HitPoints_attr.maxHp);
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',
    stateModel:  {
      attackHit: 1,
      attackDamage: 1,
      attackActionDuration: 1000
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackDamage = template.attackDamage || 1;
      this.attr._MeleeAttacker_attr.attackActionDuration = template.attackActionDuration || 1000;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        var hitValResp = this.raiseSymbolActiveEvent('calcAttackHit');
        var avoidValResp = evtData.recipient.raiseSymbolActiveEvent('calcAttackAvoid');
        // Game.util.cdebug(avoidValResp);
        var hitVal = Game.util.compactNumberArray_add(hitValResp.attackHit);
        var avoidVal = Game.util.compactNumberArray_add(avoidValResp.attackAvoid);
        if (ROT.RNG.getUniform()*(hitVal+avoidVal) > avoidVal) {
          var hitDamageResp = this.raiseSymbolActiveEvent('calcAttackDamage');
          var damageMitigateResp = evtData.recipient.raiseSymbolActiveEvent('calcDamageMitigation');

          evtData.recipient.raiseSymbolActiveEvent('attacked',{attacker:evtData.actor,attackDamage:Game.util.compactNumberArray_add(hitDamageResp.attackDamage) - Game.util.compactNumberArray_add(damageMitigateResp.damageMitigation)});
        } else {
          evtData.recipient.raiseSymbolActiveEvent('attackAvoided',{attacker:evtData.actor,recipient:evtData.recipient});
          evtData.actor.raiseSymbolActiveEvent('attackMissed',{attacker:evtData.actor,recipient:evtData.recipient});
        }
        this.setCurrentActionDuration(this.attr._MeleeAttacker_attr.attackActionDuration);
      },
      'calcAttackHit': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        return {attackHit:this.getAttackHit()};
      },
      'calcAttackDamage': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        return {attackDamage:this.getAttackDamage()};
      },
      'raiseAttackDamage': function(evtData) {
        this.setAttackDamage(this.getAttackDamage() + evtData);
      },
      'raiseAttackHit' : function(evtData) {
        this.setAttackHit(this.getAttackHit() + evtData)
      }
    }
  },
  getAttackHit: function () {
    return this.attr._MeleeAttacker_attr.attackHit;
  },
  getAttackDamage: function () {
    return this.attr._MeleeAttacker_attr.attackDamage;
  },
  setAttackHit: function (n) {
    this.attr._MeleeAttacker_attr.attackHit = n;
  },
  setAttackDamage: function (n) {
    this.attr._MeleeAttacker_attr.attackDamage = n;
  }
};

Game.EntityMixin.MeleeDefender = {
  META: {
    mixinName: 'MeleeDefender',
    mixinGroup: 'Defender',
    stateNamespace: '_MeleeDefenderr_attr',
    stateModel:  {
      attackAvoid: 0,
      damageMitigation: 0
    },
    init: function (template) {
      this.attr._MeleeDefenderr_attr.attackAvoid = template.attackAvoid || 0;
      this.attr._MeleeDefenderr_attr.damageMitigation = template.damageMitigation || 0;
    },
    listeners: {
      'calcAttackAvoid': function(evtData) {
        // console.log('MeleeDefender calcAttackAvoid');
        return {attackAvoid:this.getAttackAvoid()};
      },
      'calcDamageMitigation': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        return {damageMitigation:this.getDamageMitigation()};
      },
      'raiseAttackAvoid': function(evtData) {
        this.setAttackAvoid(this.getAttackAvoid() + evtData);
      },
      'raiseDamageMitigation' : function(evtData) {
        this.setDamageMitigation(this.getDamageMitigation() + evtData)
      }
    }
  },
  getAttackAvoid: function () {
    return this.attr._MeleeDefenderr_attr.attackAvoid;
  },
  getDamageMitigation: function () {
    return this.attr._MeleeDefenderr_attr.damageMitigation;
  },
  setAttackAvoid: function (n) {
    this.attr._MeleeDefenderr_attr.attackAvoid = n;
  },
  setDamageMitigation: function (n) {
    this.attr._MeleeDefenderr_attr.damageMitigation = n;
  }
};

Game.EntityMixin.Sight = {
  META: {
    mixinName: 'Sight',
    mixinGroup: 'Sense',
    stateNamespace: '_Sight_attr',
    stateModel:  {
      sightRadius: 3
    },
    init: function (template) {
      this.attr._Sight_attr.sightRadius = template.sightRadius || 3;
    },
    listeners: {
      'senseForEntity': function(evtData) {
        // console.log('Sight lookForEntity');
        return {entitySensed:this.canSeeEntity(evtData.senseForEntity)};
      }
    }
  },
  getSightRadius: function () {
    return this.attr._Sight_attr.sightRadius;
  },
  setSightRadius: function (n) {
    this.attr._Sight_attr.sightRadius = n;
  },

  canSeeEntity: function(entity) {
    // If not on the same map or on different maps, then exit early
    if (!entity || this.getMapId() !== entity.getMapId()) {
      return false;
    }
    return this.canSeeCoord(entity.getX(),entity.getY());
  },
  canSeeCoord: function(x_or_pos,y) {
    var otherX = x_or_pos,otherY=y;
    if (typeof x_or_pos == 'object') {
      otherX = x_or_pos.x;
      otherY = x_or_pos.y;
    }

    // If we're not within the sight radius, then we won't be in a real field of view either.
    if (Math.max(Math.abs(otherX - this.getX()),Math.abs(otherY - this.getY())) > this.attr._Sight_attr.sightRadius) {
      return false;
    }

    var inFov = this.getVisibleCells();
    return inFov[otherX+','+otherY] || false;
  },
  getVisibleCells: function() {
    var visibleCells = {'byDistance':{}};
    for (var i=0;i<=this.getSightRadius();i++) {
      visibleCells.byDistance[i] = {};
    }
    this.getMap().getFov().compute(
      this.getX(), this.getY(),
      this.getSightRadius(),
      function(x, y, radius, visibility) {
        visibleCells[x+','+y] = true;
        visibleCells.byDistance[radius][x+','+y] = true;
      }
    );
    return visibleCells;
  },
  canSeeCoord_delta: function(dx,dy) {
    return this.canSeeCoord(this.getX()+dx,this.getY()+dy);
  }
};


Game.EntityMixin.MapMemory = {
  META: {
    mixinName: 'MapMemory',
    mixinGroup: 'MapMemory',
    stateNamespace: '_MapMemory_attr',
    stateModel:{
      mapsHash: {}
    },
    init: function (template) {
      this.attr._MapMemory_attr.mapsHash = template.mapsHash || {};
    }
  },
  rememberCoords: function (coordSet,mapId) {
    var mapKey=mapId || this.getMapId();
    if (! this.attr._MapMemory_attr.mapsHash[mapKey]) {
      this.attr._MapMemory_attr.mapsHash[mapKey] = {};
    }
    for (var coord in coordSet) {
      if (coordSet.hasOwnProperty(coord) && (coord != 'byDistance')) {
        this.attr._MapMemory_attr.mapsHash[mapKey][coord] = true;
      }
    }
  },
  getRememberedCoordsForMap: function (mapId) {
    var mapKey=mapId || this.getMapId();
    return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
  }
};

Game.EntityMixin.InventoryHolder = {
  META: {
    mixinName: 'InventoryHolder',
    mixinGroup: 'InventoryHolder',
    stateNamespace: '_InventoryHolder_attr',
    stateModel:  {
      containerId: '',
      inventoryCapacity: 5
    },
    init: function (template) {
      this.attr._InventoryHolder_attr.inventoryCapacity = template.inventoryCapacity || 5;
      if (template.containerId) {
        this.attr._InventoryHolder_attr.containerId = template.containerId;
      } else {
        var container = Game.ItemGenerator.create('_inventoryContainer');
        container.setCapacity(this.attr._InventoryHolder_attr.inventoryCapacity);
        this.attr._InventoryHolder_attr.containerId = container.getId();
      }
    },
    listeners: {
      'pickupItems': function(evtData) {
        return {addedAnyItems: this.pickupItems(evtData.itemSet)};
      },
      'dropItems': function(evtData) {
        return {droppedItems: this.dropItems(evtData.itemSet)};
      }
    }
  },
  _getContainer: function () {
    return Game.DATASTORE.ITEM[this.attr._InventoryHolder_attr.containerId];
  },
  hasInventorySpace: function () {
    return this._getContainer().hasSpace();
  },
  addInventoryItems: function (items_or_ids) {
    return this._getContainer().addItems(items_or_ids);
  },
  getInventoryItemIds: function () {
    return this._getContainer().getItemIds();
  },
  extractInventoryItems: function (ids_or_idxs) {
    return this._getContainer().extractItems(ids_or_idxs);
  },
  pickupItems: function (ids_or_idxs) {
    var itemsToAdd = [];
    var fromPile = this.getMap().getItems(this.getPos());
    var pickupResult = {
      numItemsPickedUp:0,
      numItemsNotPickedUp:ids_or_idxs.length
    };

    if (fromPile.length < 1) {
      this.raiseSymbolActiveEvent('noItemsToPickup');
      return pickupResult;
    }
    if (! this._getContainer().hasSpace()) {
      this.raiseSymbolActiveEvent('inventoryFull');
      this.raiseSymbolActiveEvent('noItemsPickedUp');
      return pickupResult;
    }

    for (var i = 0; i < fromPile.length; i++) {
      if ((ids_or_idxs.indexOf(i) > -1) || (ids_or_idxs.indexOf(fromPile[i].getId()) > -1)) {
        itemsToAdd.push(fromPile[i]);
      }
    }
    var addResult = this._getContainer().addItems(itemsToAdd);
    pickupResult.numItemsPickedUp = addResult.numItemsAdded;
    pickupResult.numItemsNotPickedUp = addResult.numItemsNotAdded;
    var lastItemFromMap = '';
    for (var j = 0; j < pickupResult.numItemsPickedUp; j++) {
      lastItemFromMap = this.getMap().extractItemAt(itemsToAdd[j],this.getPos());
    }

    pickupResult.lastItemPickedUpName = lastItemFromMap.getName();
    if (pickupResult.numItemsNotPickedUp > 0) {
      this.raiseSymbolActiveEvent('someItemsPickedUp',pickupResult);
    } else {
      this.raiseSymbolActiveEvent('allItemsPickedUp',pickupResult);
    }

    return pickupResult;
  },
  dropItems: function (ids_or_idxs) {
    var itemsToDrop = this._getContainer().extractItems(ids_or_idxs);
    var dropResult = {numItemsDropped:0};
    if (itemsToDrop.length < 1) {
      this.raiseSymbolActiveEvent('inventoryEmpty');
      return dropResult;
    }
    var lastItemDropped = '';
    for (var i = 0; i < itemsToDrop.length; i++) {
      if (itemsToDrop[i]) {
        lastItemDropped = itemsToDrop[i];
        this.getMap().addItem(itemsToDrop[i],this.getPos());
        dropResult.numItemsDropped++;
      }
    }
    dropResult.lastItemDroppedName = lastItemDropped.getName();
    this.raiseSymbolActiveEvent('itemsDropped',dropResult);
    return dropResult;
  }
};

//#############################################################################
// ENTITY ACTORS / AI

Game.EntityMixin.WanderActor = {
  META: {
    mixinName: 'WanderActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      //this.getMap().attr._Scheduler.add(this,true, Game.util.randomInt(2,this.getBaseActionDuration()));
      this.attr._WanderActor_attr.baseActionDuration = template.wanderActionDuration || 1000;
      this.attr._WanderActor_attr.currentActionDuration = this.attr._WanderActor_attr.baseActionDuration;
    },
    listeners: {
      'createdEntity' : function() {
        this.getMap().attr._Scheduler.add(this,true,1);
      },
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    this.getMap().attr._TimeEngine.lock();
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    this.raiseSymbolActiveEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    this.getMap().attr._Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseSymbolActiveEvent('actionDone');
    // console.log("end wander acting");
    this.getMap().attr._TimeEngine.unlock();
  }
};

Game.EntityMixin.ChaserActor = {
  META: {
    mixinName: 'ChaserActor',
    mixinGroup: 'Actor',
    stateNamespace: '_ChaserActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      //this.getMap().attr._Scheduler.add(this,true, Game.util.randomInt(2,this.getBaseActionDuration()));
      this.attr._ChaserActor_attr.baseActionDuration = template.chaserActionDuration || 1000;
      this.attr._ChaserActor_attr.currentActionDuration = this.attr._ChaserActor_attr.baseActionDuration;
    },
    listeners: {
      'createdEntity' : function() {
        this.getMap().attr._Scheduler.add(this,true,1);
      },
    }
  },
  getBaseActionDuration: function () {
    return this.attr._ChaserActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._ChaserActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._ChaserActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._ChaserActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    var avatar = Game.getAvatar();
    var senseResp = this.raiseSymbolActiveEvent('senseForEntity',{senseForEntity:avatar});
    if (Game.util.compactBooleanArray_or(senseResp.entitySensed)) {

      // build a path instance for the avatar
      var source = this;
      var map = this.getMap();
      var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
        // If an entity is present at the tile, can't move there.
        var entity = map.getEntity(x, y);
        if (entity && entity !== avatar && entity !== source) {
          return false;
        }
        return map.getTile(x, y).isWalkable();
      }, {topology: 4});

      // compute the path from here to there
      var count = 0;
      var moveDeltas = {x:0,y:0};
      path.compute(this.getX(), this.getY(), function(x, y) {
        if (count == 1) {
          moveDeltas.x = x - source.getX();
          moveDeltas.y = y - source.getY();
        }
        count++;
      });

      return moveDeltas;
    }
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    this.getMap().attr._TimeEngine.lock();
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    this.raiseSymbolActiveEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    this.getMap().attr._Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseSymbolActiveEvent('actionDone');
    // console.log("end wander acting");
    this.getMap().attr._TimeEngine.unlock();
  }
};
