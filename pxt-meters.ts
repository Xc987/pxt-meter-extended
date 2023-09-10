// M E T E R S  -  Dials, Bars and Counters

//% color=#402080 weight=100 icon="\uf118" block="Meters"
namespace Meters {

    enum STYLES {
        //% block="Dial"
        DIAL,
        //% block="Counter"
        COUNTER,
        //% block="Bar-graph"
        BAR
    }

    // 4-digit ABCD encodes coords of pixel1(A,B); pixel2(C,D)
    const all_angles = [
        2120,
        2130,
        3130,
        3140,
        3141,
        3241,
        3242,
        3243,
        3343,
        3344,
        3334,
        2334,
        2324,
        2314,
        1314,
        1304,
        1303,
        1203,
        1202,
        1201,
        1101,
        1100,
        1110,
        2110
    ]

    /* Each digit is a 10-bit bitmap (0...1023) encoding pixels
       vertically from 2 adjacent display columns: 
            2^0=1   2^5=32
            2^1=2   2^6=64
            2^2=4   2^7=128
            2^4=8   2^8=256
            2^5=16  2^9=512
    */
    const digit_maps = [
        462,  //"0"
        992,  //"1"
        765,  //"2"
        1013, //"3"
        911,  //"4"
        951,  //"5"
        927,  //"6"
        993,  //"7"
        891,  //"8"
        999   //"9"
    ]


    let left = 0;
    let right = 0;
    let ticking = false;
    let switch_gap = 0;
    let switch_time = 0;
    let switch_vary = 0;
    let meter_style = STYLES.DIAL;

    // EXPOSED INTERFACE 

    //% block="Set Meter Style to %choice"
    //% weight=20
    export function set_style(choice: STYLES) {
        ticking = false;
        meter_style = choice;
    }


    //% block="Show Value= $value out of Maximum= $bound"
    //% weight=30
    export function show_meter(value: number, bound: number) {
        switch (meter_style) {
            case: STYLES.DIAL
                show_dial(value, bound);
                break;
            case: STYLES.METER
                show_meter(value, bound);
                break;
            case: STYLES.BAR
                show_bar(value, bound);
                break;
        }

    
    }

    function show_meter(value: number, bound: number) {
        ticking = false;
        show_digits(digit_maps[~~(value / 10)], 0, 2);
        show_digits(digit_maps[value % 10], 2, 5);
    }

    //% block="Stop reacting"
    //% weight=40
    export function cease() {
        ticking = false;
    }

    function bg_count(from: number, upto: number, tick: number) {
        ticking = false;
        left = tens;
        right = mouth;

        switch_gap = gap;
        switch_time = time;
        switch_vary = vary;
        ticking = true;
        show_digits(digit_maps[left], 0, 2);
        show_digits(digit_maps[right], 3, 5);
        control.inBackground(function () {
            while (ticking) {
                show_digit(digit_maps[alt_eyes], 0, 2);
                show_digit(digit_maps[alt_mouth], 2, 5);
                pause(tick);
                show_digit(digit_maps[left], 0, 2);
                show_digit(digit_maps[right], 2, 5);
                pause(switch_gap + randint(0, switch_vary) * switch_gap);
            }
        })
    }

    // a digit is a bitmap (0...1023) encodes two adjacent columns vertically: 
    //           1    32  
    //           2    64
    //           4   128
    //           8   256
    //          16   512
    //
    function show_digital(value: number) {
        basic.clearScreen();
        basic.pause(50);
        let bitmap = digit_maps[~~(value / 10)];
        for (let x = 0; x < 5; x++) {
            if (x == 2) {
                bitmap = digit_maps[value % 10];
            } else {
                for (let y = 0; y < 5; y++) {
                    if (bitmap & 1) {
                        led.plot(x, y);
                    } else {
                        led.unplot(x, y);
                    }
                    bitmap >>= 1;
                }
            }
        }
    }

/**
 * Provides a simple 24-position dial.
 */
    let dial24_list: number[] = [];
    let dial24_pos = -2;

    //% block="Point to %position"
    //% position.min=0 position.max=23
    export function point_to(position: number) {
        // if dial24_pos is -2, initialise first 
        if (dial24_pos == -2) {
            dial24_init();
        }
        if (dial24_pos > -1) {
            dial_flip(dial24_pos);  // unplot current position
        }
        dial24_pos = (position + 24) % 24;
        dial_flip(dial24_pos); // plot new position
    }

    //% block="Turn up to %position"
    //% position.min=0 position.max=23
    export function turn_up(position: number) {
        rotate(position, 1);
    }

    //% block="Turn down to %position"
    //% position.min=0 position.max=23
    export function turn_down(position: number) {
        rotate(position, -1);
    }

    function rotate(new_pos: number, by: number) {
        // if dial24_pos is -2, initialise first 
        if (dial24_pos == -2) {
            dial24_init();
        }
        // otherwise repeat until dial24_pos = new_pos % 24:
        while (dial24_pos != (new_pos + 24) % 24) {
            if (dial24_pos > -1) {
                dial_flip(dial24_pos); // unplot current position
            }
            dial24_pos = (dial24_pos + by + 24) % 24;
            dial_flip(dial24_pos); // plot new position
            basic.pause(25);
        }
    }


    function dial24_init() {
        dial24_pos = -1;
        basic.clearScreen();
        led.plot(2, 2);
    }

    function dial_flip(pos: number) {
        let xyxy = dial24_list[pos];
        dial24_flip_xy(~~(xyxy / 100));
        dial24_flip_xy(xyxy % 100);
    }

    function dial24_flip_xy(xy: number) {
        led.toggle(~~(xy / 10), xy % 10);
    }
}



