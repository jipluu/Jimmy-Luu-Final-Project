class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 200;
        this.DRAG = 6000;
        this.VELOCITY = 200;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        this.VELOCITY_CLIMB = 130;
        this.CLIMB_IDLE_DROP_SPEED = 35;

        this.onLadder = false;

        this.coolDown = 0;
        this.moneyCount = 0;
        this.frameCount = 0;
        this.coinsCollected = 0;

        this.isGameOver = false;
    }

    create() {
        // Tilemap & Tileset
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 150, 25);
        this.tileset1 = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_sheet");
        this.tileset2 = this.map.addTilesetImage("Space Background", "tilemap_tiles");

        // Draw layers
        this.backgroundLayer = this.map.createLayer("Background", [this.tileset1, this.tileset2], 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tileset1, this.tileset2], 0, 0);
        this.ladderLayer = this.map.createLayer("ladder", [this.tileset1, this.tileset2], 0, 0);
        this.spikeLayer = this.map.createLayer("spikes", [this.tileset1, this.tileset2], 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.spikeLayer.setCollisionByProperty({ spike: true });

        // Physics world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Background music and sounds
        this.bgm = this.sound.add("bgm", { loop: true, volume: 0.2 });
        this.bgm.play();

        this.jumpSound = this.sound.add("jumpSound", { volume: 0.3 });


        this.coinSound = this.sound.add("coinSound", { volume: 0.2 });

        // Add coins from objects layer
        this.coins = this.map.createFromObjects("Objects", {
            name: "Coins",
            key: "tilemap_sheet",
            frame: 2
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // Add doors from objects layer
        this.doors = this.map.createFromObjects("Objects", {
            name: "Door",
            key: "tilemap_sheet",
            frame: 56  // adjust frame index for door as needed
        });
        this.physics.world.enable(this.doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(this.doors);

        // Player setup
        my.sprite.player = this.physics.add.sprite(30, 210, "platformer_characters", "tile_0000.png").setScale(0.8);
        my.sprite.player.setCollideWorldBounds(true);

        // Colliders & overlaps
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => this.playerDie(), null, this);
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            if (this.isGameOver) return;
            this.coinSound.play();
            coin.destroy();
            this.moneyCount += 100;
            this.scoreText.setText('Score: ' + this.moneyCount);
        });
        this.physics.add.overlap(my.sprite.player, this.doorGroup, () => {
            if (this.isGameOver) return;
            this.scene.start('endGameScene');
        });

        // Controls
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Debug toggle
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        // Particles
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_02.png', 'dirt_01.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            alpha: { start: 0.1, end: 0.1 },
        });
        my.vfx.walking.stop();

        // Create the particle emitter when the scene starts
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png', 'muzzle_04.png'],  // Choose particle textures
            scale: { start: 0.05, end: 0.1 },           // Particles grow slightly
            lifespan: 300,                              // They disappear after 300ms
            alpha: { start: 1, end: 0 },                // Fade out as they die
            angle: { min: 240, max: 300 },              // Spray downward in a cone
            speed: { min: 50, max: 150 },               // Randomized burst speed
            quantity: 5                                 // Emit 5 particles per burst
        });

        my.vfx.jumping.stop(); // Only emits when player jumps and not emit continuously

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.startFollow(my.sprite.player);

        // Fixed UI Texts
        const zoom = 3.5;
        this.cameras.main.setZoom(zoom);
        // Game width and height
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Objective text - center top, adjusted for zoom
        this.objectiveText = this.add.text(
            gameWidth / 2 / zoom,  // adjust x for zoom
            10 / zoom,             // adjust y for zoom
            "Escape this Black and White Planet",
            {
                fontSize: (24 / zoom) + 'px',   // scale font size down
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5, 0).setScrollFactor(0);

        // Score text - top-left, adjusted for zoom
        this.scoreText = this.add.text(
            16 / zoom,
            16 / zoom, 
            'Score: 0',
            {
                fontSize: (20 / zoom) + 'px', // scale font size down
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setScrollFactor(0);

        // Game over text - center screen, fixed
        this.gameOverText = this.add.text(
            gameWidth / 2,
            gameHeight / 2,
            'Game Over\nPress R to Restart',
            {
                fontSize: '40px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        this.gameOverText.setVisible(false);
    }

    update() {
        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }
            return;
        }

        let playerTile = this.map.getTileAtWorldXY(
            my.sprite.player.x,
            my.sprite.player.y,
            true,
            this.cameras.main,
            this.ladderLayer
        );
        this.onLadder = playerTile?.properties?.ladder || false;

        if (this.onLadder) {
            my.sprite.player.body.setAllowGravity(false);
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);

            if (cursors.up.isDown) {
                my.sprite.player.setVelocityY(-this.VELOCITY_CLIMB);
                my.sprite.player.anims.play('climb', true);
            } else if (cursors.down.isDown) {
                my.sprite.player.setVelocityY(this.VELOCITY_CLIMB);
                my.sprite.player.anims.play('climb', true);
            } else {
                my.sprite.player.setVelocityY(this.CLIMB_IDLE_DROP_SPEED);
                my.sprite.player.anims.play('climb_idle', true);
            }

            if (cursors.left.isDown) {
                my.sprite.player.setVelocityX(-this.VELOCITY);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                let nextTile = this.map.getTileAtWorldXY(my.sprite.player.x - 2, my.sprite.player.y, true, this.cameras.main, this.ladderLayer);
                if (!nextTile?.properties?.ladder) {
                    this.onLadder = false;
                    my.sprite.player.body.setAllowGravity(true);
                }
            } else if (cursors.right.isDown) {
                my.sprite.player.setVelocityX(this.VELOCITY);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                let nextTile = this.map.getTileAtWorldXY(my.sprite.player.x + 2, my.sprite.player.y, true, this.cameras.main, this.ladderLayer);
                if (!nextTile?.properties?.ladder) {
                    this.onLadder = false;
                    my.sprite.player.body.setAllowGravity(true);
                }
            } else {
                my.sprite.player.setVelocityX(0);
            }
        } else {
            my.sprite.player.body.setAllowGravity(true);

            if (cursors.left.isDown) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
            } else if (cursors.right.isDown) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 16, my.sprite.player.displayHeight / 2 - 5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
            } else {
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }

            if (!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.up) && my.sprite.player.body.blocked.down) {
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
                this.jumpSound.play();

                // Trigger jump particles
                my.vfx.jumping.setParticleSpeed({ min: 50, max: 150 }, { min: -20, max: 20 });
                my.vfx.jumping.emitParticleAt(
                    my.sprite.player.x,
                    my.sprite.player.y + my.sprite.player.displayHeight / 2
                );
            }
        }
    }

    playerDie() {
        this.isGameOver = true;
        this.gameOverText.setVisible(true);
        my.vfx.walking.stop();
        this.bgm.stop();
        my.sprite.player.setTint(0xff0000);
        my.sprite.player.setVelocity(0, 0);
        my.sprite.player.body.setAllowGravity(false);
    }
}
