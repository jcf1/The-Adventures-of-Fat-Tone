Game.KeyBinding = {
  _availableBindings: ['directional','numpad','waxd'],
  _curBindingKey: '',
  _currentBindingLookup: {},
  _bindingHelpText: '',
  setKeyBinding:function (bindingSetKey) {
    this._curBindingKey = bindingSetKey || 'directional';
    this.calcBindingLookups();
  },
  getKeyBinding:function () {
    return this._curBindingKey;
  },
  swapToNextKeyBinding: function () {
    var nextBindingIndex = this._availableBindings.indexOf(this._curBindingKey);
    if (nextBindingIndex < 0) { return; } // can only swap to next if the current is in the 'available' list - prevents swapping away from special sets like 'persist'
    nextBindingIndex++;
    if (nextBindingIndex >= this._availableBindings.length) {
      nextBindingIndex = 0;
    }
    this.setKeyBinding(this._availableBindings[nextBindingIndex]);
    Game.Message.ageMessages();
    this.informPlayer();
  },
  informPlayer: function () {
    Game.Message.sendMessage('using '+this._curBindingKey+' key bindings');
    Game.renderMessage();
  },

  calcBindingLookups:function () {
    // console.log('calcBindingLookups for '+this._curBindingKey);
    this._currentBindingLookup = {
      keydown:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      },
      keypress:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      }
    };

    var bindingHelpInfo = [];
    for (var actionLookupKey in this.Action) {
      if (this.Action.hasOwnProperty(actionLookupKey)) {
        var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
        if (bindingInfo) {
          var metaKey = 'nometa';
          if (bindingInfo.inputMetaCtrl && bindingInfo.inputMetaShift) {
            metaKey = 'ctrlshift';
          } else if (bindingInfo.inputMetaShift) {
            metaKey = 'shift';
          } else if (bindingInfo.inputMetaCtrl) {
            metaKey = 'ctrl';
          }

          this._currentBindingLookup[bindingInfo.inputType][metaKey][bindingInfo.inputMatch] = {
            actionKey: actionLookupKey,
            boundLabel: bindingInfo.label,
            binding: bindingInfo,
            action: Game.KeyBinding.Action[actionLookupKey]
          };

          bindingHelpInfo.push(actionLookupKey);
        }
      }
    }

    bindingHelpInfo.sort(function(a, b){
      if (Game.KeyBinding.Action[a].ordering != Game.KeyBinding.Action[b].ordering) {
        return a-b;
      }
      // string cmp on 'short' attribute
      return (Game.KeyBinding.Action[a].short<Game.KeyBinding.Action[b].short)?-1:((Game.KeyBinding.Action[a].short>Game.KeyBinding.Action[b].short)?1:0);
    });
    this._bindingHelpText = '';
    var hasBaseMovements = false;
    var previousOrdering = 1;
    for (var i = 0; i < bindingHelpInfo.length; i++) {
      var curAction = Game.KeyBinding.Action[bindingHelpInfo[i]];

      if (curAction.action_group != 'base_movement') {
        if (Math.floor(previousOrdering) != Math.floor(curAction.ordering)) {
          this._bindingHelpText += "\n";
        }
        this._bindingHelpText += curAction[curAction.hasOwnProperty(this._curBindingKey)?this._curBindingKey:'all'].label+'  '+curAction.long+"\n";
        previousOrdering = curAction.ordering;
      } else {
        hasBaseMovements = true;
      }
    }
    if (hasBaseMovements) {
      if(this.getKeyBinding() == 'directional') {
        var movementHelpTemplate = "---------------\n" +
          "|      mU      |\n" +
          "|mLmWmR|\n" + //The left and right arrows plus the '[SPACE]' cause the need for more space on the other lines
          "|      mD      |\n" +
          "---------------\n";
        movementHelpTemplate += "Use Directional Arrow Keys"
      } else
        var movementHelpTemplate = "-------\n|  mU  |\n|  |  |\n|mL-mW-mR|\n|  |  |\n|  mD  |\n-------";
      movementHelpTemplate = movementHelpTemplate.replace('mU',Game.KeyBinding.Action.MOVE_U[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mL',Game.KeyBinding.Action.MOVE_L[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mW',Game.KeyBinding.Action.MOVE_WAIT[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mR',Game.KeyBinding.Action.MOVE_R[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mD',Game.KeyBinding.Action.MOVE_D[this._curBindingKey].label);
      this._bindingHelpText = "movement\n"+movementHelpTemplate + "\n"+ this._bindingHelpText;
    }
  },

  getInputBinding: function (inputType,inputData) {
    var metaKey = 'nometa';
    if (inputData.ctrlKey && inputData.shiftKey) {
      metaKey = 'ctrlshift';
    } else if (inputData.shiftKey) {
      metaKey = 'shift';
    } else if (inputData.ctrlKey) {
      metaKey = 'ctrl';
    }
    var bindingKey = inputData.keyCode;
    if (inputType === 'keypress') {
        bindingKey = String.fromCharCode(inputData.charCode);
    }
    return this._currentBindingLookup[inputType][metaKey][bindingKey] || false;
  },

  getLabelForAction: function (actionLookupKey) {
    if (! this.Action[actionLookupKey]) {
      return '';
    }
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo.label;
    }
    return '';
  },
  getBindingForAction: function (actionLookupKey) {
    if (! this.Action[actionLookupKey]) {
      return '';
    }
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo;
    }
    return '';
  },
  getBindingHelpText: function () {
    return this._bindingHelpText;
  },

  Action: {
    PERSISTENCE      : {action_group:'meta'    ,guid:Game.util.uniqueId() ,ordering:2 ,short:'games'    ,long :'save or load or start a new game',
      numpad: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false},
      directional: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false},
      waxd: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PERSISTENCE_SAVE : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.1 ,short:'save'     ,long :'save the current game',
      persist: {label:'S' ,inputMatch:ROT.VK_S ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    PERSISTENCE_LOAD : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.2 ,short:'load'  ,long :'load from the saved game',
      persist: {label:'L' ,inputMatch:ROT.VK_L ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    PERSISTENCE_NEW  : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.3 ,short:'new game' ,long :'start a new game',
      persist: {label:'N' ,inputMatch:ROT.VK_N ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    ANSWER_YES : {action_group:'answer' ,guid:Game.util.uniqueId() ,ordering:2.4 ,short:'yes' ,long :'answer yes to a question',
      all: {label:'y' ,inputMatch:ROT.VK_Y ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    ANSWER_NO : {action_group:'answer' ,guid:Game.util.uniqueId() ,ordering:2.5 ,short:'no' ,long :'answer no to a question',
      all: {label:'n' ,inputMatch:ROT.VK_N ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    MOVE_U    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight up',
      directional:{label:'↑' ,inputMatch:ROT.VK_UP ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      numpad: {label:'8' ,inputMatch:ROT.VK_NUMPAD8 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'w' ,inputMatch:ROT.VK_W       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_L    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight left',
      directional:{label:'←' ,inputMatch:ROT.VK_LEFT ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      numpad: {label:'4' ,inputMatch:ROT.VK_NUMPAD4 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'a' ,inputMatch:ROT.VK_A       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_WAIT : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move nowhere - wait one turn',
      directional:{label:'[SPACE]' ,inputMatch:ROT.VK_SPACE ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      numpad: {label:'5' ,inputMatch:ROT.VK_NUMPAD5 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'s' ,inputMatch:ROT.VK_S       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_R    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight right',
      directional:{label:'→' ,inputMatch:ROT.VK_RIGHT ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      numpad: {label:'6' ,inputMatch:ROT.VK_NUMPAD6 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'d' ,inputMatch:ROT.VK_D       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_D    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight down',
      directional:{label:'↓' ,inputMatch:ROT.VK_DOWN ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      numpad: {label:'2' ,inputMatch:ROT.VK_NUMPAD2 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'x' ,inputMatch:ROT.VK_X       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    INVENTORY : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.0 ,short:'inventory'  ,long :'show items in inventory' ,
      all: {label:'i' ,inputMatch:ROT.VK_I ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
    },
    PROCESS_SELECTIONS  : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.01 ,short:'act on' ,long :'take action with/on selected items'         ,
      LAYER_inventoryDrop: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      LAYER_inventoryPickup: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PICKUP : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.1 ,short:'get'  ,long :'get / pickup one or more items in the current space' ,
      all: {label:'g' ,inputMatch:ROT.VK_G ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
    },
    DROP   : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.2 ,short:'drop' ,long :'drop one or more items in the current space'         ,
      numpad: {label:'d' ,inputMatch:ROT.VK_D ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false} ,
      directional: {label:'d' ,inputMatch:ROT.VK_D ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false} ,
      waxd  : {label:'D' ,inputMatch:ROT.VK_D ,inputType:'keydown' ,inputMetaShift:true  ,inputMetaCtrl:false},
      LAYER_inventoryListing: {label:'d' ,inputMatch:ROT.VK_D ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    EAT   : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.3 ,short:'eat' ,long :'consume food to reduce hunger'         ,
      all: {label:'e' ,inputMatch:ROT.VK_E ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false} ,
      LAYER_inventoryListing: {label:'E' ,inputMatch:ROT.VK_E ,inputType:'keydown' ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    EXAMINE : {action_group:'inventory' ,guid:Game.util.uniqueId() ,ordering:5.9 ,short:'examine' ,long :'get details about a carried item',
      numpad: {label:'x' ,inputMatch:ROT.VK_X ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      directional: {label:'x' ,inputMatch:ROT.VK_X ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      waxd  : {label:'X' ,inputMatch:ROT.VK_X ,inputType:'keydown' ,inputMetaShift:true  ,inputMetaCtrl:false},
      LAYER_inventoryListing: {label:'x' ,inputMatch:ROT.VK_X ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    },

    DATA_NAV_UP : {action_group:'data_nav' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'up' ,long :'scroll content up',
      all: {label:'['     ,inputMatch:'['      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    DATA_NAV_DOWN : {action_group:'data_nav' ,guid:Game.util.uniqueId() ,ordering:4.2 ,short:'down' ,long :'scroll content down',
      all: {label:']'     ,inputMatch:']'      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    HELP : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'help'     ,long:'show which keys do which commands'      ,
      all: {label:'?'     ,inputMatch:'?'      ,inputType:'keypress' ,inputMetaShift:true ,inputMetaCtrl:false}
    },
    CHANGE_BINDINGS : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'controls' ,long:'change which keys do which commands'    ,
      all: {label:'\\'  ,inputMatch:ROT.VK_BACK_SLASH ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    CANCEL          : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'cancel'   ,long:'cancel/close the current action/screen' ,
      all: {label:'Esc' ,inputMatch:ROT.VK_ESCAPE     ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    }
  }
};
