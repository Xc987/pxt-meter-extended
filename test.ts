
enum Tests {
    Thermometer,
    Clicker,
    Bangometer,
    Compass,
    NoiseMeter,
    WaterSpill,
    PlumbLine,
    LieDetector
}
const maxTest = 8;

function setupTest(test: number) {
    meter.clear();
    switch (test) {
        case Tests.Thermometer:
            meter.digital();
            break;
        case Tests.Clicker:
            count = 0;
            meter.digital();
            break;
        case Tests.Bangometer:
            meter.use(meter.Styles.Spiral, 0, 1000);
            break;
        case Tests.Compass:
            input.calibrateCompass();
            basic.pause(2000);
            meter.use(meter.Styles.Dial, 360, 0);
            break;
        case Tests.NoiseMeter:
            meter.use(meter.Styles.Bar, 0, 100);
            signal = 0;
            break;
        case Tests.WaterSpill:
            meter.use(meter.Styles.Tidal, -30, 30);
            break;
        case Tests.PlumbLine:
            meter.use(meter.Styles.Dial, 360, 0);
            break;
        case Tests.LieDetector:
            meter.use(meter.Styles.Needle, 600, 800);
            pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive);
            signal = 700;
            break;
    }
}

function updateTest(test: number) {
    switch (test) {
        case Tests.Thermometer:
            meter.show(input.temperature());
            basic.pause(5000);
            break;
        case Tests.Clicker:
            meter.show(count);
            break;
        case Tests.Bangometer:
            if (input.isGesture(Gesture.ThreeG)) {
                meter.show(input.acceleration(Dimension.Strength));
                meter.show(0, 1500);
            }
            break;
        case Tests.Compass:
            meter.show(input.compassHeading());
            basic.pause(500);
            break;
        case Tests.NoiseMeter:
            signal = (signal + input.soundLevel()) / 2;
            meter.show(signal);
            basic.pause(250);
            break;
        case Tests.WaterSpill:
            meter.show(input.rotation(Rotation.Roll) - input.rotation(Rotation.Pitch), 500);
            basic.pause(1000);
            break;
        case Tests.PlumbLine:
            meter.show((input.rotation(Rotation.Pitch) + 442) % 360);
            basic.pause(1000);
            break;
        case Tests.LieDetector:
            signal = (signal + pins.analogReadPin(AnalogPin.P2)) / 2;
            meter.show(signal);
            basic.pause(500);
            break;
    }
}

input.onButtonPressed(Button.A, function () {
    if (choosing) {
        if (choice > 0) { 
            choice--;
            basic.showNumber(choice);
        }
    } else {
        if (choice = Tests.Clicker) {
            if (count > -1) { count-- }
        }
    }
});

input.onButtonPressed(Button.B, function() {
    if (choosing) {
        if (choice < maxTest) { 
            choice++;
            basic.showNumber(choice);
        }
    } else {
        if (choice = Tests.Clicker) {
            if (count < 101) { count++ }
        }
    }
});

input.onButtonPressed(Button.AB, function() {
    if (choosing) {
        setupTest(choice); // initiate test
        choosing = false;
    } else {
        meter.clear(); // terminate test
        music.tonePlayable(Note.C, music.beat(BeatFraction.Sixteenth))
        basic.showNumber(choice);
        choosing = true;
    }
});

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
})

let choice = 0;
let choosing = true;
let count = 0;
let signal = 0;
basic.showNumber(choice);
while (true) {  // keep iterating...
    updateTest(choice);
}
