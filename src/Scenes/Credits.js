class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create() {
        // Title
        this.add.text(this.cameras.main.width / 2, 100, 
            "Credits", {
                fontSize: '48px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0.5);

        // Credits content
        this.add.text(this.cameras.main.width / 2, 200, 
            "\n\n\n\nGame Design: Jimmy Luu\n\nProgramming: Jimmy Luu\n\nAssets: Kenny Assets\n\nMusic: Goose Ninja\n\n SFX: jsfxr and iGottic", {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

        // Instructions to return
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 100,
            "Press B to go back", {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

        // Add key input
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
            this.scene.start("titleScene");
        }
    }
}

