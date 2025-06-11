class EndGame extends Phaser.Scene {
    constructor() {
        super("endGameScene");
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 70,
            'Tou have escaped the black and white alien planet!',
            {
                fontSize: '48px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            'Press R to Restart',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 60,
            'Press M for Main Menu',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.rKey = this.input.keyboard.addKey('R');
        this.mKey = this.input.keyboard.addKey('M');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start('platformerScene');
        }
        if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
            this.scene.start('titleScene');
        }
    }
}
