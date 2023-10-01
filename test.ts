/* 
Thermometer:
   uses the default digital meter to show the current microbit temperature
   (constrained to the range 0 degrees to 99 degrees)

Clicker:
   A simple use of the default digital meter lets you count things up
   (with Button A) and down(with Button B).  Possibly useful for counting
   people at an event; or cars in a carpark; or even in sheep in a pen, 
   though the limit is 99.

Bangometer:
  This example monitors jolts and knocks using the Spiral indicator.
  The wound-up size of the display shows the strength of each bang
  (up to a maximun of 1000 milli-gravities). The indicator is then 
  unwound back to zero over a time of 1.5 seconds.

Compass:
  The following code uses the rotary Dial style to show a compass needle that
  (should) always point North.Note that the dial uses a reversed scale 
  counting from 360 degrees down to zero. (You will first have to tilt the screen 
  as instructed to initialise the magnetometer)

Noise Meter:
  The following code uses the Bar style to show peak noise levels, sampled 
  four times a second.The signal uses a rolling average, so gradually dies away 
  over time. If it's too loud the indicator will flash to show a range error.

Water Spill:
  This example uses the Tidal indicator to simulate spilling water from the 
  bottom left to the top right as you tilt the microbit. A half-second animation 
  delay makes the movement smoother.

Plumb-line:
  Another use of the accelerometer maps the Pitch rotation(displaced by a 
  right-angle) onto the Dial indicator, with a reversed range, so that the 
  needle always hangs downwards.
  
Lie-detector
  This final example uses the Needle indicator to monitor the capacitive input
  on Pin2 of the microbit. The signal is a rolling average, and despite 
  possible inputs ranging from[0.. 1023], the sensitivity has been 
  experimentally focused onto a smaller working range of[600.. 800].
*/


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
            if (input.buttonIsPressed(Button.A) && (count < 101)) {
                count++;
            }
            if (input.buttonIsPressed(Button.B) && (count > -2)) {
                count--;
            }
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


let choice = 0;
let choosing = true;
let count = 0;
let signal = 0;

basic.forever(function () {
    if (choosing) {
        // listen to buttons
        if (input.buttonIsPressed(Button.AB)) {
            choosing = false; // kick off chosen test on next iteration
        } else {
            if (input.buttonIsPressed(Button.A) && (choice < maxTest)) {
                choice++;
            }
            if (input.buttonIsPressed(Button.B) && (choice > 0)) {
                choice--;
            }
            basic.showNumber(choice)
            pause(250);
        }
    } else {
        //go for it...
        setupTest(choice);
        while (~input.isGesture(Gesture.LogoDown)) {
            updateTest(choice);
        };
        // turning it over halts current test
        meter.reset();
        music.tonePlayable(Note.C, music.beat(BeatFraction.Sixteenth))
        choosing = true;
    }
});