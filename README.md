```package
meter=github:grandpabond/pxt-meter
```
# meter --- Adding values to your project!

Many microbit projects are about taking measurements. The datalogger extension lets you make a historical 
record of your measurements, but your project can often be brought to life by adding a real-time visual 
indicator. The  ``||meter:meter||`` extension provides various ways to let you monitor a changing value.

The default meter shows a direct 2-digit readout of a value, which should lie in the range [0...99].
For many purposes 2 digits provide enough accuracy, especially when showing readings as percentages.

### ~reminder
NOTE:  Since each digit uses only 10 pixels, they are inevitably somewhat stylized. So it takes a 
bit of practice to read the digital meter accurately  --especially the digits "0" and "8"
### ~

## Displaying a value #meter-show

```sig
meter.show(value,  ms)
```
This block adjusts the meter to show a new reading.

> ``||meter:value||`` - is the new value to be shown.

If you click on the "+", you can set an optional parameter:

> ``||meter:ms||`` - is used to control the settling time of an animated adjustment to the new value. 
The meter will display in-between values, arriving at the new ``||meter:value||`` after ms millisecs.  

### ~reminder
NOTE: If you try to show a value that is too big or too small, your meter will stop at the 
nearest end, but will then flash to indicate the "out-of-range" error.
### ~

## Choosing an indicator meter #meter-use

```sig
meter.use(style, start, limit)
```
Often the exact numeric value is less important than providing a rapid visual indication of a measurement.
The ``||meter:meter.use()||`` block lets you select one of a number of possible visual indicators, with 
varying resolutions.

> ``||meter:style||`` - chooses one of the indicator Styles (see below)

> ``||meter:start||`` - is the value that maps to the bottom reading

> ``||meter:limit||`` - is the value that maps to the top reading

### ~reminder
The range for indicator displays is completely flexible: when ``||meter:start||`` is bigger 
than ``||meter:limit||``, higher values will just show lower readings. Either end can be a negative value, and they 
need not even be whole numbers: fractional values are quite OK.
### ~

### Indicator Styles:

> ``||meter:Styles.Bar||``This meter style (similar to the built-in ``||led:led.plotBarGraph||`` block) fills up 
each row in turn from the bottom, with 1, 3, or 5 centred pixels, giving a total of 15 distinct displays.

> ``||meter:Styles.Dial||``
This meter style shows a short 3-pixel pointer rotating from the 12 o'clock position through 24 different angles.
  
> ``||meter:Styles.Needle||``
This meter style show a needle pivoting on the top left corner. It swings clockwise from horizontal to vertical in 17 steps.

> ``||meter:Styles.Tidal||``
This meter style fills the display progressively from the bottom left to the top right in 25 steps.

> ``||meter:Styles.Blob||``
This meter style is a simple centred disc that grows from a single pixel to fill the screen in 7 steps. 

> ``||meter:Styles.Spiral||``
This meter style is similar to the Blob, but winds round clockwise in a spiral to fill the screen in 25 steps.

## Showing numbers with the digital meter #meter-digital

```sig
meter.digital()
```
Use this block to switch back to showing numerical measurements. The range will always be from "00" to "99". 
(Any other values will flash the out-of-range error.)


## Stopping display animation #meter-hide

```sig
meter.freeze()
```
Use this block to stop background changes to the meter, interrupting any animated 
adjustment or (more usefully) turning off out-of-range error flashing.

## Hiding the meter #meter-hide

```sig
meter.hide()
```
When you no longer want to display a meter, this block clears the display.

# Examples

Here are some ideas for using ``||meter:meter||`` blocks to monitor various microbit readings...

## Thermometer
This code uses the default digital meter to show the current microbit temperature (constrained 
to the range 0 degrees to 99 degrees):

```blocks
basic.forever(function () {
    meter.show(input.temperature());
    basic.pause(5000);
});
```

## Clicker
A simple use of the default digital meter lets you count things up (with Button B) and down 
(with Button A). Possibly useful for counting people at an event; or cars in a carpark; 
or even sheep in a pen, though the limit is 99!

```blocks
let count = 0;

input.onButtonPressed(Button.B, function () {
    count += 1;
    if (count > 100) {
        count = 100;
    }
    meter.show(count);
});

input.onButtonPressed(Button.A, function () {
    count += -1;
    if (count < -1) {
        count = -1;
    }
    meter.show(count);
});
```

## Breath Trainer
A tiny example to guide your breathing, using your chosen visual indicator. (Try them all out in turn!)

```blocks
meter.use(meter.Styles.Bar, -1, 1);
let y = 0;
basic.forever(function () {
    y = Math.sin(input.runningTime() / 1500);
    meter.show(y);
})
```

## Bangometer
This example monitors jolts and knocks using the ``||meter:Styles.Blob||`` indicator. The size 
of the displayed "blob" roughly shows a rolling average of the strength of each bang 
(up to a maximun of 1000 milli-gravities). 
The indicator then dies away over a time of 1.5 seconds. 

```blocks
meter.use(meter.Styles.Blob, 50, 1000);
let gravityWas = 1000;

basic.forever(function () {
    basic.pause(20);
    gravity = input.acceleration(Dimension.Strength);
    bang = Math.abs(gravity - gravityWas);
	if (bang > 50) { 
		meter.show(bang);
		basic.pause(50);
		meter.show(50, 1500);
	}
    gravityWas = gravity;
});
```          
	 
## Compass
The following code uses the rotary ``||meter:Styles.Dial||`` style to show a compass needle that (should) 
always point North. Note that the dial uses a reversed scale counting from 360 degrees down to zero. 
(You will first have to tilt the screen as instructed to calibrate the magnetometer to its surroundings)

```blocks
input.calibrateCompass();
basic.pause(2000);
meter.use(meter.Styles.Dial, 359, 0);

basic.forever(function () { 
    // to centralise pointer, offset readings anti-clockwise
    let pointer= (input.compassHeading() + 352.5) % 360
    meter.show(pointer);
    basic.pause(500);
});
```

## Noise Meter
The following code uses the ``||meter:Styles.Spiral||`` style to show peak noise levels, sampled four times a 
second. The animated spiral uses a rolling average, so grows gradually and then slowly unwinds over time. 
If it's too loud the indicator will flash to show a range error.

```blocks
meter.use(meter.Styles.Spiral, 40, 80);
let value = 60;

basic.forever(function () {
    value = (value + input.soundLevel()) / 2;
    meter.show(value,800);
    basic.pause(250);
})
```

## Water Spill
This example uses the ``||meter:Styles.Tidal||`` indicator to simulate spilling water from the bottom left 
to the top right as you tilt the microbit. 
A rolling average and a half-second animation delay makes the movement smoother and adds some viscosity.

```blocks
meter.use(meter.Styles.Tidal, -30, 20);
let value = 60;

basic.forever(function () {
    value = (value + input.rotation(Rotation.Roll) - input.rotation(Rotation.Pitch))/2
	meter.show(value, 500);
    basic.pause(1000);
});
```

## Plumb-line
For this use of the accelerometer we'll need a function to compute the Yaw rotation. This is then continuously 
mapped (displaced by a right-angle, plus a bit extra) onto the ``||meter:Styles.Dial||`` indicator, so that the needle always hangs downwards.

```blocks
meter.use(meter.Styles.Dial, 0, 360);

function rotationYaw():number {
	let ax = input.acceleration(Dimension.X);
	let ay = input.acceleration(Dimension.Y);
	return (Math.atan2(ay, ax) * 180 / Math.PI);
}

basic.forever(function () {
// to centralise pointer, offset yaw clockwise
	meter.show(((rotationYaw() + 457.5) % 360)) 
    basic.pause(1000);
});
```

# Lie-detector
This final example uses the ``||meter:Styles.Needle||`` indicator to monitor the capacitive input on Pin2 of the microbit 
(which may or may not reflect the truthfulness of the person touching it!).

The value is a rolling average, and despite possible inputs ranging from [0 .. 1023], the sensitivity 
has been experimentally focused onto a smaller working range of [600 .. 900].

```blocks
meter.use(meter.Styles.Needle, 600, 900);
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive);
let value = 700;

basic.forever(function () {
    value = (value + pins.analogReadPin(AnalogPin.P2)) / 2;
    meter.show(value);
    basic.pause(500);
});
```




- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
> Open this page at [https://grandpabond.github.io/pxt-meter/](https://grandpabond.github.io/pxt-meter/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/grandpabond/pxt-meter** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/grandpabond/pxt-meter** and click import

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
