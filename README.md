```package
meter=github:grandpabond/pxt-meters
```
# meter --- Adding values to your project!

Many microbit projects are about taking measurements. The datalogger extension lets you make a historical record 
of your measurements, but your project can often be brought to life by adding a real-time visual indicator.  
The  ``||meter:meter||`` extension provides various ways to let you monitor a changing value.

The default meter shows a direct 2-digit readout of a value, which should lie in the range [0...99].

For many purposes 2 digits provide enough accuracy, especially when showing readings as percentages.

### ~reminder
NOTE:  Since there are only 10 pixels for each digit they are inevitably somewhat stylized and take a bit of practice to read accurately --especially "0" and "8"
### ~

# Displaying a value #meter-show

```sig
meter.show(value,  ms)
```
This block adjusts the meter to show a new reading.

> ``||meter:value||`` - is the new value to be shown.

If you click on the "+", you can set an optional parameter:

> ``||meter:ms||`` - is used to control the settling time of an animated adjustment to the new value. 
The meter will display intermediate values leading to the new ``||meter:value||`` after ms millisecs.  
(This background animation only occurs if ``||meter:ms||`` exceeds 50ms).

### ~reminder
NOTE: Any attempt to show a value that lies outside the [``||meter:start||``...``||meter:limit||``] range will be constrained 
to the nearest bound, but will then flash to indicate the out-of-range error.
### ~

# Choosing an indicator meter #meter-use

```sig
meter.use(style, start, limit)
```
Often the exact numeric value is less important than providing a rapid visual indication of a measurement.
The ``||meter:use()||`` block selects one of a number of possible visual indicators:

> ``||meter:style||`` - chooses the indicator style (see below)

> ``||meter:start||`` - is the value that maps to the bottom reading

> ``||meter:limit||`` - is the value that maps to the top reading

### ~reminder
The operating range for indicator displays is completely flexible: it is quite permissible for ``||meter:start||`` 
to exceed ``||meter:limit||``, or for either (or both) to be negative. They need not be whole numbers either: 
fractional values are quite OK.
### ~

## Indicator Styles:
> ``||meter:BAR||``
This meter style is similar to the built-in bar-graph function, filling up each row in turn from the bottom, 
with 1, 3, or 5 centred pixels, giving a total of 15 distinct displays.

> ``||meter:DIAL||``
This meter style shows a short 3-pixel pointer rotating from the 12 o'clock position through 24 different angles.
  
> ``||meter:NEEDLE||``
This meter style swings a needle centred on the top left corner from horizontal clockwise to vertical in 17 steps.

> ``||meter:TIDAL||``
This meter style fills the display progressively from the bottom left to the top right in 25 steps.

> ``||meter:BLOB||``
This meter style is a simple centred disc that grows from a single pixel to fill the screen in 7 steps. 

> ``||meter:SPIRAL||``
This meter style is similar to the BLOB but winds round clockwise in a spiral to fill the screen in 25 steps.

# Showing numbers with the digital meter #meter-digital

```sig
meter.digital()
```
Use this block to switch back to showing numerical measurements.

# Resetting the meter #meter-reset

```sig
meter.reset()
```
This block clears any out-of-range flashing and resets the meter.

# Synchronising with an animated adjustment #meter-wait

```sig
meter.wait()
```
This block suspends your code until any background animated adjustment has reached the new value.
(Returns immediately if there is no animation going on.)

# Interrupting an animated adjustment #meter-stop

```sig
meter.stop()
```
This block stops any background animated adjustment immediately, wherever it has got to. 
(So it may not yet have reached the new value.)

# Examples


## Thermometer
This code uses the default digital meter to show the current microbit temperature (constrained to the range 0 degrees to 99 degrees):

```block
basic.forever(function () {
    meter.show(input.temperature());
    basic.pause(5000);
});
```

## Clicker
A simple use of the default digital meter lets you count things up (with Button A) and down (with Button B). Possibly useful for counting people at an event; or cars in a carpark; or even in sheep in a pen, though the limit is 99.

```block
let count = 0;

input.onButtonPressed(Button.A, function () {
    count += 1;
    if (count > 100) {
        count = 100;
    }
    meter.show(count);
});

input.onButtonPressed(Button.B, function () {
    count += -1;
    if (count < -1) {
        count = -1;
    };
    meter.show(count);
});
```

## Bangometer
This example monitors jolts and knocks using the ``||meter:SPIRAL||`` indicator. The wound-up size of the display shows the strength of each bang (up to a maximun of 1000 milli-gravities). The indicator is then unwound back to zero over a time of 1.5 seconds. The ``||meter:BLOB||`` style would be equally appropriate, though with fewer distinct displays.

```block
meter.use(STYLES.SPIRAL, 0, 1000);

input.onGesture(Gesture.ThreeG, function () {
    meter.show(input.acceleration(Dimension.Strength));
    meter.show(0, 1500);
});
```
	 
## Compass
The following code uses the rotary ``||meter:DIAL||`` style to show a compass needle that (should) always point North. Note that the dial uses a reversed scale counting from 360 degrees down to zero. 
(You will first have to tilt the screen as instructed to initialise the magnetometer)

```block
input.calibrateCompass();
basic.pause(2000);
meter.use(STYLES.DIAL, 360, 0);

basic.forever(function () {
    meter.show(input.compassHeading());
    basic.pause(500);
});
```

## Noise Meter
The following code uses the ``||meter:BAR||`` style to show peak noise levels, sampled four times a second. The signal uses a rolling average, so gradually dies away over time. If it's too loud the indicator will flash to show a range error.

```block
meter.use(STYLES.BAR, 0, 100);
let signal = 0;

basic.forever(function () {
    signal = (signal + input.soundLevel()) / 2;
    meter.show(signal);
    basic.pause(250);
})
```

## Water Spill
This example uses the ``||meter:TIDAL||`` indicator to simulate spilling water from the bottom left to the top right as you tilt the microbit. A half-second animation delay makes the movement smoother.

```block
meter.use(STYLES.TIDAL, -30, 30);

basic.forever(function () {
    meter.show(input.rotation(Rotation.Roll) - input.rotation(Rotation.Pitch), 500);
    basic.pause(1000);
});
```

## Plumb-line
Another use of the accelerometer maps the Pitch rotation (displaced by a right-angle) onto the ``||meter:DIAL||`` indicator, with a reversed range, so that the needle always hangs downwards.

```block
meter.use(STYLES.DIAL, 360, 0);

basic.forever(function () {
    meter.show((input.rotation(Rotation.Pitch) + 442) % 360);
    basic.pause(1000);
});
```

# Lie-detector
This final example uses the ``||meter:NEEDLE||`` indicator to monitor the capacitive input on Pin2 of the microbit.
The signal is a rolling average, and despite possible inputs ranging from [0 to 1023], the sensitivity has been experimentally focused on the smaller range [600 to 800].

```block
meter.use(STYLES.NEEDLE, 600, 800);
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive);
let signal = 700;

basic.forever(function () {
    signal = (signal + pins.analogReadPin(AnalogPin.P2)) / 2;
    meter.show(signal);
    basic.pause(500);
});
```







- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
> Open this page at [https://grandpabond.github.io/pxt-meters/](https://grandpabond.github.io/pxt-meters/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/grandpabond/pxt-meters** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/grandpabond/pxt-meters** and click import

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
