class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Characters and tilemap
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("tilemap_cheet", "monochrome_tilemap_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj");

        this.load.image('laser', 'assets/laser.png');

        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Particles
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Audio
        this.load.audio("coinSound", "pickupCoin.wav");
        this.load.audio('bgm', 'slow-travel.wav');
        this.load.audio("jumpSound", "jump.wav");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0000.png" }],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0001.png" }],
            
        });

        this.scene.start("platformerScene");
    }
}

