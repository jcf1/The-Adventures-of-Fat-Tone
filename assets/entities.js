Game.EntityGenerator = new Game.Generator('entities',Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'\u26C4',
  fg:'#dda',
  maxHp: 10,
  mixins: ["PlayerActor","PlayerMessager","WalkerCorporeal","HitPoints","Chronicle","MeleeAttacker"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr:'%',
  fg:'#6b6',
  maxHp: 1,
  mixins: ["HitPoints"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr:'🐊',
  fg:'#f98',
  maxHp: 2,
  mixins: ["HitPoints","WanderActor","WalkerCorporeal"]
});

Game.EntityGenerator.learn({
  name: 'dog',
  chr:'🐕',
  fg:'#8B5A2B',
  maxHp: 3,
  mixins: ["HitPoints","WanderActor","WalkerCorporeal","MeleeAttacker"]
});

Game.EntityGenerator.learn({
  name: 'Evan Williams',
  chr:'🎅',
  fg:'#8B5A2B',
  maxHp: 3,
  mixins: ["HitPoints","WanderActor","WalkerCorporeal","MeleeAttacker"]
});
