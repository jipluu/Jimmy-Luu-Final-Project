class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100,
            "Alien Planet Escape", {
                fontSize: '64px',
                fill: '#00ffcc',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50,
            "Press P to Play", {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

        // Setup P key
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.scene.start("loadScene");  // start the loading scene
        }
    }
}

