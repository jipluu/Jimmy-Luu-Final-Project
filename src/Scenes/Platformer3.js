class Platformer3 extends Phaser.Scene {
    constructor() {
        super("platformerScene3");
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
        this.moneyCount = 0;
        this.isGameOver = false;
        this.hasKey = false;
        this.platformSpeed = 50;
    }

    create() {
        // Load map and tilesets
        this.map = this.add.tilemap("platformer-level-3", 16, 16, 150, 25);
        this.tileset1 = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_sheet");
        this.tileset2 = this.map.addTilesetImage("Space Background", "tilemap_tiles");

        // Create layers
        this.backgroundLayer = this.map.createLayer("Background", [this.tileset1, this.tileset2], 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tileset1, this.tileset2], 0, 0);
        this.ladderLayer = this.map.createLayer("ladder", [this.tileset1, this.tileset2], 0, 0);
        this.spikeLayer = this.map.createLayer("spikes", [this.tileset1, this.tileset2], 0, 0);
        this.gateLayer = this.map.createLayer("gate", [this.tileset1, this.tileset2], 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });
        this.spikeLayer.setCollisionByProperty({ spike: true });
        this.gateLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Sounds
        this.bgm = this.sound.add("bgm", { loop: true, volume: 0.2 });
        this.bgm.play();
        this.jumpSound = this.sound.add("jumpSound", { volume: 0.3 });
        this.coinSound = this.sound.add("coinSound", { volume: 0.2 });
        this.walkSound = this.sound.add("footstep2", { volume: 0.3 });
        this.dieSound = this.sound.add("explosion", { volume: 0.5, loop: false });

        this.lastStepTime = 0;
        this.stepInterval = 300;

        // Objects: Coins, Doors, Keys
        this.coins = this.map.createFromObjects("Objects", { name: "Coins", key: "tilemap_sheet", frame: 2 });
        this.doors = this.map.createFromObjects("Objects", { name: "Door", key: "tilemap_sheet", frame: 56 });
        this.keys = this.map.createFromObjects("Objects", { name: "key", key: "tilemap_sheet", frame: 96 });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);
        this.doorGroup = this.add.group(this.doors);
        this.keyGroup = this.add.group(this.keys);

        // Player
        my.sprite.player = this.physics.add.sprite(30, 210, "platformer_characters", "tile_0000.png").setScale(0.8);
        my.sprite.player.setCollideWorldBounds(true);

        // Enemies
        this.enemyGroup = this.physics.add.group();
        this.map.getObjectLayer("Objects").objects.forEach(obj => {
            if (obj.name === "enemy") {
                const enemy = this.enemyGroup.create(obj.x, obj.y - obj.height, "tilemap_sheet", 320);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocityX(50);
                enemy.setBounceX(1);
                enemy.setImmovable(true);
                enemy.body.setSize(enemy.width * 0.8, enemy.height);
                enemy.setDepth(1);
            }
        });
        this.physics.add.collider(this.enemyGroup, this.groundLayer);

        // Colliders and overlaps
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => this.playerDie(), null, this);
        this.physics.add.collider(my.sprite.player, this.gateLayer);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            if (!this.isGameOver) {
                this.coinSound.play();
                coin.destroy();
                this.moneyCount += 100;
                this.scoreText.setText('Score: ' + this.moneyCount);
            }
        });

        this.physics.add.overlap(my.sprite.player, this.doorGroup, () => {
            if (!this.isGameOver) {
                this.scene.start('endGameScene');
            }
        });

        this.physics.add.overlap(my.sprite.player, this.keyGroup, (player, key) => {
            if (this.isGameOver) return;
            key.destroy();
            this.hasKey = true;
            this.objectiveText.setText("Key collected! Gate unlocked!");
            this.unlockGate(); // Immediately disable gate collision
        });

        this.physics.add.overlap(my.sprite.player, this.enemyGroup, () => {
            if (!this.isGameOver) this.playerDie();
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
        }).stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png', 'muzzle_04.png'],
            scale: { start: 0.05, end: 0.1 },
            lifespan: 300,
            alpha: { start: 1, end: 0 },
            angle: { min: 240, max: 300 },
            speed: { min: 50, max: 150 },
            quantity: 5
        }).stop();

        // Camera and UI
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.startFollow(my.sprite.player);
        const zoom = 3.5;
        this.cameras.main.setZoom(zoom);

        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        this.objectiveText = this.add.text(gameWidth / 2 / zoom, 10 / zoom, "Escape this Black and White Planet", {
            fontSize: (24 / zoom) + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0).setScrollFactor(0);

        this.scoreText = this.add.text(16 / zoom, 16 / zoom, 'Score: 0', {
            fontSize: (20 / zoom) + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        this.gameOverText = this.add.text(gameWidth / 2, gameHeight / 2, 'Game Over\nPress R to Restart', {
            fontSize: '40px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    }

    update() {
        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }
            return;
        }

        let playerTile = this.map.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y, true, this.cameras.main, this.ladderLayer);
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
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);

            this.handleGroundMovement();
        }

        // Enemy AI (patrol)
        this.enemyGroup.getChildren().forEach(enemy => {
            const direction = enemy.body.velocity.x > 0 ? 1 : -1;
            const offsetX = direction * enemy.width * 0.5;
            const offsetY = enemy.height * 0.5 + 2;
            const nextTile = this.groundLayer.getTileAtWorldXY(enemy.x + offsetX, enemy.y + offsetY, true);

            if (!nextTile || !nextTile.collides) {
                enemy.setVelocityX(-enemy.body.velocity.x);
                enemy.toggleFlipX();
            }
        });
    }

    handleGroundMovement() {
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (this.time.now - this.lastStepTime > this.stepInterval) {
                    this.walkSound.play();
                    this.lastStepTime = this.time.now;
                }
            } else {
                my.vfx.walking.stop();
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 16, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (this.time.now - this.lastStepTime > this.stepInterval) {
                    this.walkSound.play();
                    this.lastStepTime = this.time.now;
                }
            } else {
                my.vfx.walking.stop();
            }
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
            my.vfx.jumping.setParticleSpeed({ min: 50, max: 150 }, { min: -20, max: 20 });
            my.vfx.jumping.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight / 2);
            my.vfx.walking.stop();
        }
    }

    handleLadderMovement() {
        my.sprite.player.body.setAllowGravity(false);
        my.sprite.player.setVelocityY(0);
        my.sprite.player.setAccelerationX(0);
        my.sprite.player.anims.play('climb', true);

        if (cursors.up.isDown) my.sprite.player.setVelocityY(-this.VELOCITY_CLIMB);
        if (cursors.down.isDown) my.sprite.player.setVelocityY(this.VELOCITY_CLIMB);

        if (my.sprite.player.body.velocity.y > this.CLIMB_IDLE_DROP_SPEED) {
            my.sprite.player.anims.play('idle');
        }
    }

    playerDie() {
        if (this.isGameOver) return; // Prevent multiple triggers

        this.isGameOver = true;
        this.bgm.stop();

        // Stop dieSound if playing, then play once
        if (this.dieSound.isPlaying) {
            this.dieSound.stop();
        }
        this.dieSound.play();

        // When dieSound ends, explicitly stop it to be safe
        this.dieSound.once('complete', () => {
            this.dieSound.stop();
        });

        my.sprite.player.setTint(0xff0000);
        my.sprite.player.setVelocity(0, 0);
        my.sprite.player.anims.stop();

        this.gameOverText.setVisible(true);
    }

    unlockGate() {
        this.gateLayer.setCollisionByProperty({ collides: false });
        this.gateLayer.forEachTile(tile => {
            if (tile.properties.collides) {
                tile.setCollision(false);
            }
        });
    }
}
