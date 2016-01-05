Game.Message = {
  _currMessage: '',
  renderOn: function(display) {
    display.clear();
    display.drawText(0,0,this._currMessage);
  },
  sendMessage: function(msg) {
    this._currMessage = msg;
    Game.renderMessage();
  },
  clearMessage: function() {
    this._currMessage = '';
  }
}
