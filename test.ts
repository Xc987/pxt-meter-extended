
enum Tests {
    Thermometer,
    Clicker,
    Bangometer,
    Compass,
    NoiseMeter,
    WaterSpill,
    PlumbLine,
    LieDetector,
    LightLevel
};

function setupTest(test: number) {
    switch (test) {
        case Tests.Thermometer:
            meter.digital();
            showOff(0, 99);
            break;
        case Tests.Clicker:
            meter.digital();
            showOff(0, 99);
            count = 0;
            break;
        case Tests.Bangometer:
            meter.use(meter.Styles.Blob, 50, 1000);
            showOff(0, 1000);
            newValue = 1000; // gravity when at rest
            break;
        case Tests.Compass:
            input.calibrateCompass();
            basic.pause(2000);
            meter.use(meter.Styles.Dial, 359, 0);
            showOff(0, 359);
            break;
        case Tests.NoiseMeter:
            meter.use(meter.Styles.Spiral, 40, 80);
            showOff(40, 80);
            newValue = 60;
            break;
        case Tests.WaterSpill:
            meter.use(meter.Styles.Tidal, -30, 20);
            showOff(-30, 20);
            newValue = 0;
            break;
        case Tests.PlumbLine:
            meter.use(meter.Styles.Dial, 0, 359);
            showOff(0, 359);
            break;
        case Tests.LieDetector:
            meter.use(meter.Styles.Needle, 600, 900);
            pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive);
            showOff(600, 900);
            newValue = 750;
            break;
        case Tests.LightLevel:
            meter.use(meter.Styles.Bar, 50, 200);
            showOff(0, 359);
            break;
    }
}

function showOff(a: number, b: number) {
    // sweep meter from a to b then back again, over 3 seconds
    meter.show(a);
    basic.pause(250);
    meter.show(b, 1000);
    basic.pause(1500);
    meter.show(a, 1000);
    basic.pause(1500);
}

function updateTest(test: number) {
    oldValue = newValue;
    switch (test) {
        case Tests.Thermometer:
            newValue = input.temperature();
            meter.show(newValue);
            basic.pause(500);
            break;
        case Tests.Clicker:
            meter.show(count);
            basic.pause(50);
            break;
        case Tests.Bangometer:
            newValue = input.acceleration(Dimension.Strength);
            metric = Math.abs(newValue - oldValue) // rate of change
            if (metric > 50) {
                meter.show(metric);
                basic.pause(50); // show new maximum
                meter.show(50, 1500); // then dwindle over time
            }
            basic.pause(10); // to detect bangs, we can't hang about!
            break;
        case Tests.Compass:
            newValue = input.compassHeading();
            meter.show(newValue);
            basic.pause(500);
            break;
        case Tests.NoiseMeter:  // TODO add threshold 
            newValue = input.soundLevel();
            metric = (oldValue + newValue) / 2; // use rolling average
            meter.show(metric, 800); // adjust gradually
            basic.pause(250);
            break;
        case Tests.WaterSpill:
            newValue = input.rotation(Rotation.Roll) - input.rotation(Rotation.Pitch);
            //metric = (oldValue + newValue) / 2;  use rolling average
            meter.show(newValue, 1000); // add some viscosity
            // meter.hide();
            // basic.showNumber(newValue);
            basic.pause(500);
            break;
        case Tests.PlumbLine:
            // input.rotation(Rotation.Yaw) doesn't seem to exist!
            let ax = input.acceleration(Dimension.X);
            let ay = input.acceleration(Dimension.Y);
            let yaw = Math.atan2(ay, ax) * 180 / Math.PI;
            newValue = (yaw + 450) % 360;
            meter.show(newValue);
            basic.pause(100);
            break;
        case Tests.LieDetector:
            newValue = pins.analogReadPin(AnalogPin.P2);
            metric = (oldValue + newValue) / 2; // use rolling average
            meter.show(metric);
            basic.pause(500);
            break;
        case Tests.LightLevel:
            newValue = input.lightLevel();
            meter.show(newValue, 1000); // adjust slowly
            basic.pause(500); // reassess twice per sec
            break;
    }
}

input.onButtonPressed(Button.A, function () {
    if (choosing) {
        if (choice > 0) {
            choice -= 1;
        }
    } else {
        if (choice = Tests.Clicker) {
            if (count > -1) {
                count -= 1;
            }
        }
    }
})

input.onButtonPressed(Button.B, function () {
    if (choosing) {
        if (choice < maxTest) {
            choice += 1;
        }
    } else {
        if (choice = Tests.Clicker) {
            if (count < 100) {
                count += 1;
            }
        }
    }
})

input.onButtonPressed(Button.AB, function () {
    choosing = !(choosing);
})

let maxTest = Tests.LightLevel;
let newValue = 0;
let oldValue = 0;
let metric = 0;
let count = 0;
let choice = 0;
let choosing = true;
let running = false;
while (true) {
    // keep iterating...
    if (choosing) {  // select a test
        if (running) { // terminate current test's display first
            meter.hide();
            basic.pause(100); // let that take effect
            running = false;
        } // state is now [!running and choosing]
        basic.showNumber(choice);
        basic.pause(100);
        // pressing A+B will toggle state to [!running & !choosing]
    } else {  // run the currently selected test
        if (!running) { // set the test up first
            setupTest(choice);
            running = true;
        } // state is now {running & !choosing]
        updateTest(choice);
        /* ...followed by various test-dependent delays, during which
          animated adjustment/flashing may take place, and (eventually)
          pressing A+B will toggle state to [running & choosing]
        */
    }
}

