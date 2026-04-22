const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeButton(dataset = {}) {
    return {
        dataset,
        className: '',
        textContent: '',
        type: 'button',
        listeners: {},
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener(type, cb) {
            this.listeners[type] = cb;
        },
        appendChild() {},
    };
}

function createHarness() {
    const mobileControls = [
        makeButton({ action: 'left' }),
        makeButton({ action: 'right' }),
        makeButton({ action: 'pause' }),
        makeButton({ action: 'shoot' }),
    ];

    const mobileKeys = {
        innerHTML: '',
        children: [],
        listeners: {},
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        appendChild(node) {
            this.children.push(node);
        },
        addEventListener(type, cb) {
            this.listeners[type] = cb;
        },
    };

    const soundToggle = makeButton({});
    const mobileTutorial = { classList: { add() {}, remove() {}, toggle() {} } };
    const gameContainer = { style: {} };

    const elements = {
        'game-canvas': {
            width: 640,
            height: 480,
            style: {},
            getContext() {
                return {
                    fillStyle: '',
                    strokeStyle: '',
                    lineWidth: 1,
                    font: '',
                    textAlign: 'left',
                    globalAlpha: 1,
                    fillRect() {},
                    strokeRect() {},
                    strokeText() {},
                    fillText() {},
                    beginPath() {},
                    moveTo() {},
                    lineTo() {},
                    stroke() {},
                    closePath() {},
                    fill() {},
                    createLinearGradient() {
                        return { addColorStop() {} };
                    },
                    save() {},
                    restore() {},
                    translate() {},
                };
            },
        },
        'game-container': gameContainer,
        'start-screen': { classList: { add() {}, remove() {}, toggle() {} } },
        'game-over-screen': { classList: { add() {}, remove() {}, toggle() {} } },
        'pause-badge': { classList: { add() {}, remove() {}, toggle() {} } },
        'final-score': { textContent: '0' },
        'mobile-keys': mobileKeys,
        'mobile-tutorial': mobileTutorial,
        'sound-toggle': soundToggle,
    };

    const listeners = {};
    const localStorageData = {};

    const document = {
        getElementById(id) {
            return elements[id];
        },
        addEventListener(type, cb) {
            listeners[`document:${type}`] = cb;
        },
        createElement() {
            return makeButton({});
        },
        querySelectorAll(selector) {
            if (selector === '#mobile-controls [data-action]') {
                return mobileControls;
            }
            return [];
        },
    };

    const windowObj = {
        innerWidth: 430,
        innerHeight: 820,
        AudioContext: function AudioContext() {
            this.currentTime = 0;
            this.destination = {};
            this.createOscillator = () => ({
                connect() {},
                frequency: { setValueAtTime() {} },
                start() {},
                stop() {},
            });
            this.createGain = () => ({
                connect() {},
                gain: {
                    setValueAtTime() {},
                    exponentialRampToValueAtTime() {},
                },
            });
        },
        webkitAudioContext: null,
        addEventListener(type, cb) {
            listeners[`window:${type}`] = cb;
        },
        localStorage: {
            getItem(key) {
                return Object.prototype.hasOwnProperty.call(localStorageData, key)
                    ? localStorageData[key]
                    : null;
            },
            setItem(key, value) {
                localStorageData[key] = String(value);
            },
        },
    };

    const context = {
        console,
        Math,
        Date,
        setTimeout(fn) {
            fn();
            return 0;
        },
        clearTimeout() {},
        requestAnimationFrame() {
            return 1;
        },
        window: windowObj,
        document,
    };

    windowObj.window = windowObj;
    windowObj.document = document;

    return {
        context,
        elements,
        mobileControls,
        mobileKeys,
        soundToggle,
        localStorageData,
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function loadGame() {
    const htmlPath = path.join(__dirname, 'typing-game.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/<script>([\s\S]*)<\/script>/);
    if (!match) {
        throw new Error('Could not find script block in typing-game.html');
    }

    const harness = createHarness();
    vm.createContext(harness.context);
    vm.runInContext(`${match[1]}\nthis.__Game__ = Game; this.__FallingLetter__ = FallingLetter;`, harness.context);

    return {
        Game: harness.context.__Game__,
        FallingLetter: harness.context.__FallingLetter__,
        harness,
    };
}

function run() {
    const { Game, FallingLetter, harness } = loadGame();
    const game = new Game();

    assert(harness.elements['game-container'].style.width, 'Responsive sizing did not initialize');
    assert(harness.soundToggle.textContent === 'SOUND ON', 'Sound toggle did not initialize');
    assert(game.settings.soundEnabled === true, 'Default settings were not loaded');
    assert(harness.mobileKeys.children.length > 0, 'Mobile keys were not generated');

    game.startGame();
    assert(game.wave === 1, 'Game did not start at wave 1');
    assert(game.waveBreather > 0, 'Wave breather did not initialize');

    for (let i = 0; i < 170; i++) {
        game.update(0.016);
    }
    assert(game.waveSpawned > 0 || game.letters.length > 0, 'Wave spawning did not begin');

    game.wave = 4;
    game.waveSpawned = 0;
    game.waveTarget = game.getWaveTarget(4);
    game.waveBreather = 0;
    game.lastSpawnTime = game.spawnInterval;
    game.letters = [];
    game.update(0.016);
    assert(game.letters[0]?.boss, 'Boss wave did not spawn a boss');

    const boss = game.letters[0];
    boss.y = 210;
    const hpBeforeType = boss.hp;
    game.checkInput(String(boss.char).toLowerCase());
    assert(boss.hp < hpBeforeType, 'Typing did not damage boss');
    assert(game.combo >= 1, 'Boss typing hit did not affect combo');

    game.bullets.push({
        update() {},
        intersects() { return true; },
        isOffScreen() { return false; },
    });
    const hpBeforeShot = boss.hp;
    game.update(0.016);
    assert(boss.hp < hpBeforeShot || game.letters.length === 0, 'Shooting did not damage boss');

    game.combo = 7;
    game.comboPeak = 12;
    game.breakCombo('MISS');
    assert(game.combo === 0 && game.comboPeak === 10, 'Combo decay tuning failed');

    game.togglePause();
    assert(game.state === 'PAUSED', 'Pause failed');
    game.togglePause();
    assert(game.state === 'PLAYING', 'Resume failed');

    harness.soundToggle.listeners.click();
    assert(game.sound.enabled === false, 'Sound toggle UI failed to disable sound');
    assert(harness.localStorageData['type-attack-settings'], 'Settings were not persisted');
    harness.soundToggle.listeners.click();
    assert(game.sound.enabled === true, 'Sound toggle UI failed to re-enable sound');

    game.handleInput({ code: 'KeyM', key: 'm', preventDefault() {} });
    assert(game.sound.enabled === true, 'Plain M should NOT toggle sound');

    game.handleInput({ code: 'KeyP', key: 'p', preventDefault() {} });
    assert(game.state === 'PLAYING', 'Plain P should NOT pause');

    game.setSoundEnabled(true);
    game.handleInput({ code: 'KeyP', key: 'p', ctrlKey: true, preventDefault() {} });
    assert(game.state === 'PAUSED', 'Pause via Ctrl+P failed');
    game.handleInput({ code: 'KeyP', key: 'p', ctrlKey: true, preventDefault() {} });
    assert(game.state === 'PLAYING', 'Resume via Ctrl+P failed');

    game.handleInput({ code: 'KeyM', key: 'm', ctrlKey: true, preventDefault() {} });
    assert(game.sound.enabled === false, 'Mute via Ctrl+M failed');
    game.handleInput({ code: 'KeyM', key: 'm', ctrlKey: true, preventDefault() {} });
    assert(game.sound.enabled === true, 'Unmute via Ctrl+M failed');

    const mobileA = harness.mobileKeys.children.find((button) => button.dataset.key === 'A');
    game.settings.showMobileTutorial = true;
    game.syncMobileTutorial();
    game.letters = [new FallingLetter('A', 100, game.letterSpeed)];
    game.letters[0].y = 200;
    harness.mobileKeys.listeners.pointerdown({ preventDefault() {}, target: mobileA });
    assert(game.settings.showMobileTutorial === false, 'Mobile tutorial dismissal failed');

    console.log('test-typing-game.js: all checks passed');
}

run();
