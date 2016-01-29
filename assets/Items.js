Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name:'_inventoryContainer',mixins: ["Container"], capacity: 10});

Game.ItemGenerator.learn({
  name: 'apple',
  description: 'a nice juicy apple - yum!',
  chr:'🍎',
  fg:'#f32',
  foodValue: 100,
  goldValue: 20,
  mixins: ['Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Cup Noodle',
  description: 'The Food of the Gods!',
  chr:'🍜',
  fg:'#f32',
  foodValue: 1000,
  goldValue: 100,
  mixins: ['Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Bagel Bite',
  description: 'OHH BABY! Decilicious Pizza Bagels!',
  chr:'🍕',
  fg:'#f32',
  foodValue: 200,
  goldValue: 35,
  mixins: ['Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Curry and Rice',
  description: 'Ahhhh, nothing like warm curry to fill ya up!',
  chr:'🍛',
  fg:'#f32',
  foodValue: 400,
  goldValue: 60,
  mixins: ['Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Keystone',
  description: 'Cheap beer... Well better than nothing. (Raises Power)',
  chr:'🍺',
  fg:'#f32',
  foodValue: 50,
  goldValue: 50,
  elixirBoost: 'power',
  mixins: ['Elixir', 'Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'BrewDog Beer',
  description: 'I don\'t always drink good beer, but when I do, I drink BrewDog! (Raises All Stats)',
  chr:'🍻',
  fg:'#f32',
  foodValue: 200,
  goldValue: 125,
  elixirBoost: 'Boost All Skills',
  mixins: ['Elixir', 'Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Lemon-Ice Tea',
  description: 'The World\'s Finest Tea! (Raises Accuracy)',
  chr:'🍹',
  fg:'#f32',
  foodValue: 50,
  goldValue: 50,
  elixirBoost: 'accuracy',
  mixins: ['Elixir', 'Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Coke-a Nola',
  description: 'Brent\'s Special Coke Recipe! \'It tastes like Candy!\'~Nola (Raises Dodging)',
  chr:'🍹',
  fg:'#f32',
  foodValue: 50,
  goldValue: 50,
  elixirBoost: 'dodging',
  mixins: ['Elixir', 'Food', 'Buyable']
});

Game.ItemGenerator.learn({
  name: 'Red Kenny Supreme',
  description: 'Brent\'s Special Cocktail Recipe! \'It\'s alright.\'~Kenny (Raises Defense)',
  chr:'🍹',
  fg:'#f32',
  foodValue: 50,
  goldValue: 50,
  elixirBoost: 'defense',
  mixins: ['Elixir', 'Food', 'Buyable']
});
