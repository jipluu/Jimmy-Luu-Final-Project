class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        // Title Text
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 120,
            "Alien Planet Escape", {
                fontSize: '48px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5);

        // Play instruction
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2,
            "Press P to Play", {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

        // Credits instruction
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50,
            "Press C for Credits", {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

        // Controls instructions
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 120,
            "Use Arrow Keys to Move", {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

        // Setup keys
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.scene.start("loadScene");  // start the loading scene
        }
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.scene.start("creditsScene"); 
        }
    }
}

