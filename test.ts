

// T E S T S
function doTest(which: number) {
    go = true;
    switch (which) {
        case 0:
            meter.digital();
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(i);
                basic.pause(200);
            }
            break;

        case 1:  // fractional, adjusting over 9 seconds
            meter.use(STYLES.SPIRAL, 0, 1.0);
            meter.show(1.0, 9000);
            meter.wait();
            meter.show(0, 500);
            break;

        case 2:  // reversed
            meter.use(STYLES.BLOB, 50, 0);
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(i);
                basic.pause(100);
            }
            meter.show(0, 500);
            break;

        case 3: // negative values
            meter.use(STYLES.BAR, 0, -99);
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(-i);
                basic.pause(70);
            }
            meter.show(0, 500);
            break;

        case 4:  // partial range
            meter.use(STYLES.DIAL, 30, 70);
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(i);
                basic.pause(100);
            }
            meter.show(50, 500);
            break;

        case 5:  // angle
            meter.use(STYLES.NEEDLE, 0, 90);
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(i);
                basic.pause(50);
            }
            meter.show(45, 500);
            break;

        case 6: // negative partial range
            meter.use(STYLES.TIDAL, -4.5, -9.5);
            basic.pause(1000);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(-i / 10);
                basic.pause(50);
            }
            meter.show(0, 500);
            break;

        case 7:
            // adjustments
            meter.use(STYLES.BAR, 0, 99);
            basic.pause(1000);
            meter.show(75, 500);
            meter.wait();
            basic.pause(1000);

            meter.show(50, 500);
            meter.wait();
            basic.pause(1000);

            // with rangeErrors...
            meter.show(100, 500);
            meter.wait();
            basic.pause(4000);

            meter.show(-1, 500);
            meter.wait();
            basic.pause(2000);

            meter.show(-1);
            basic.pause(2000);

            meter.show(101);
            break;

        case 8:
            // point upwards for 20 sec
            meter.use(STYLES.DIAL, 0, 360);
            let gx = 0;
            let gy = 0;
            let angle = 0;
            for (let i = 0; go && (i < 50); i++) {
                gx = input.acceleration(Dimension.X);
                gy = input.acceleration(Dimension.Y);
                angle = (Math.round(Math.atan2(gx, gy) * 180 / Math.PI) + 360) % 360;
                //basic.showNumber(angle);
                meter.show(360 - angle, 300);
                basic.pause(400);
            }
            break;

        case 9:
            // noise-meter for 20 sec
            meter.use(STYLES.BAR, 0, 200);
            for (let i = 0; go && (i < 100); i++) {
                meter.show(input.soundLevel());
                basic.pause(200);
            }
    }
}
let test = 0;
let topTest = 9;
let go = false;

input.onButtonPressed(Button.A, function () {
    go = false;
    meter.reset();
    if (test > 0) {
        test--;
    }
    basic.showNumber(test);
});
input.onButtonPressed(Button.B, function () {
    go = false;
    meter.reset();
    if (test < topTest) {
        test++;
    }
    basic.showNumber(test);
});
input.onButtonPressed(Button.AB, function () {
    go = false;
    meter.reset();
    doTest(test)
});