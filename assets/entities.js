Game.EntityGenerator = new Game.Generator('entities',Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'\u2603',
  fg:'#dda',
  maxHp: 10,
  mixins: [Game.EntityMixin.WalkerCorporeal,Game.EntityMixin.HitPoints,Game.EntityMixin.Chronicle,Game.EntityMixin.MeleeAttacker,Game.EntityMixin.PlayerMessager]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr:'%',
  fg:'#6b6',
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn({
  name: 'dog',
  chr:'\u046C',
  fg:'#8B5A2B',
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});
