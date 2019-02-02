var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer,enemigos, palanca, puerta, arboles, suelotrampa,sorpresa,items;
var text;
var score = "Intenta salir del castillo";
var music;
var diamante=0;
var corazon=0;
var llave=0;
var colliderTrampa;
var colliderEnemigo;

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', '/Phaser_1/assets/map2.json');
    // tiles in spritesheet 
   // this.load.spritesheet('tiles', '/Phaser_1/assets/tiles.png', {frameWidth: 70, frameHeight: 70});
    this.load.spritesheet('tiles2', '/Phaser_1/assets/tiles2.png', {frameWidth: 70, frameHeight: 70});
    // simple coin image
    //this.load.image('coin', 'assets/coinGold.png');

    // player animations
    this.load.atlas('player', '/Phaser_1/assets/player.png', 'assets/player.json');
    // Sound
    this.load.audio("music","/Phaser_1/assets/Camille_Saint-Saens-Aquarium.ogg")
}

function create() {
    // load the map 
    map = this.make.tilemap({key: 'map'});

    // tiles for the ground layer
    //var groundTiles = map.addTilesetImage('tiles');  //al final lo he quitado, pero tendría que haberlo quitado
    var groundTiles2 = map.addTilesetImage('tiles2');  //solo necesitaba pulsar en el bonton embed tited
    // create the ground layer
    groundLayer = map.createDynamicLayer('World', groundTiles2, 0, 0);
    enemigos = map.createDynamicLayer('enemigos', groundTiles2, 0, 0);
    palanca = map.createDynamicLayer('palanca', groundTiles2, 0, 0);
    puerta = map.createDynamicLayer('puerta', groundTiles2, 0, 0);
    arboles = map.createDynamicLayer('arboles', groundTiles2, 0, 0);
    suelotrampa = map.createDynamicLayer('suelotrampa', groundTiles2/*[groundTiles,groundTiles2]*/, 0, 0);
    //sorpresa = map.createDynamicLayer('sorpresa', groundTiles2, 0, 0);
    items = map.createDynamicLayer('items', groundTiles2, 0, 0);
    
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    suelotrampa.setCollisionByExclusion([-1]);
    enemigos.setCollisionByExclusion([-1]);
    // coin image used as tileset
    //var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    //coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(200, 200, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map    

  
    
    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width, player.height-8);
    
    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);
    colliderTrampa=this.physics.add.collider(suelotrampa, player);
    colliderEnemigo=this.physics.add.collider(enemigos, player);
 
    items.setTileIndexCallback([5,8,9], collectItem, this);  //5 el diamante
    this.physics.add.overlap(player, items);
    palanca.setTileIndexCallback(4, collectPalanca, this);  
    this.physics.add.overlap(player, palanca);
    puerta.setTileIndexCallback(16, collectPuerta, this);  
    this.physics.add.overlap(player, puerta);


    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });


    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#222');

    // this text will show the score
    text = this.add.text(20, 570, 'Intenta salir del castillo', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);

    //Play Sound
    music = this.sound.add("music");
    music.play();
}
function collectPuerta(sprite,tile){
    console.log(tile);
    //palanca.removeTileAt(tile.x, tile.y);
    //colliderTrampa.destroy();
    if(corazon==1&&diamante==1&&llave==1){
        text.setText("Terminaste el nivel: FELICIDADES");
        player.alpha=0;
    }else{
        text.setText("Aún ten faltan misiones que cumplir");
    }
    
}
function collectPalanca(sprite,tile){
    console.log(tile);
    palanca.removeTileAt(tile.x, tile.y);
    colliderTrampa.destroy();
    suelotrampa.alpha=0;
    
}
function collectItem(sprite,tile){
    console.log(tile);
    if(tile.index==5){
        diamante=1;
        text.setText("Has cogido el diamante, BIEN!!!");
    }
    if(tile.index==9){
        corazon=1;
        text.setText("Has cogido el corazon, ahora tus enemigos no bloquean la salida!!");
        colliderEnemigo.destroy();
        enemigos.alpha=0;
    }
    if(tile.index==8){
        llave=1;
        text.setText("Has cogido la llave, BIEN!!!");
    }
    items.removeTileAt(tile.x, tile.y);

}


function update(time, delta) {
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
    // jump 
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-500);        
    }
}
