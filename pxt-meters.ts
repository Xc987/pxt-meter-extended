// M E T E R S  -  Dials, Bars and Counters 

//% color=#402080 weight=100 icon="\uf118" block="Meters" 
namespace Meters {

    enum STYLES {
        //% block="Blob [0..5]"
        BLOB,
        //% block="Bar [0..15]" 
        BAR,
        //% block="Dial [0..24]" 
        DIAL,
        //% block="Tide [0..25]"
        TIDE,
        //% block="Counter [0..99]" 
        COUNTER
    }
    const blobMaps = [

    ];

    // Each angled pointer uses three pixels: centre--pixel1--pixel2
    // Each 4-digit value ABCD encodes coords of pixel1(A,B); pixel2(C,D) 
    const dialMaps = [
        2120, 2130, 3130, 3140, 3141, 3241,
        3242, 3243, 3343, 3344, 3334, 2334,
        2324, 2314, 1314, 1304, 1303, 1203,
        1202, 1201, 1101, 1100, 1110, 2110];

    /* Each digit is a 10-bit bitmap (0...1023) encoding pixels vertically 
       from 2 adjacent display columns:  
            2^0=1   2^5=32 
            2^1=2   2^6=64 
            2^2=4   2^7=128 
            2^4=8   2^8=256 
            2^5=16  2^9=512 
    */
    const digitMaps = [
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


    let bgCounting = false;
    let bgFlashing = false; // flash top value if over-topped
    let meterStyle = STYLES.DIAL;

    // EXPOSED USER INTERFACE  

    //% block="Set Meter Style to %choice" 
    //% weight=20 
    export function setStyle(choice: STYLES) {
        bgCounting = false;
        meterStyle = choice;
    }


    //% block="Show Value= $value out of Maximum= $bound" 
    //% weight=30 
    export function showMeter(value: number, bound: number) {
        switch (meterStyle) {
            case STYLES.DIAL:
                showDial(value, bound);
                break;
            case STYLES.METER:
                showDigits(value, bound);
                break;
            case STYLES.BAR:
                showBar(value, bound);
                break;
        }
    }


    //% block="Stop bgCounting" 
    //% weight=40 
    export function stopbgCounting() {
        bgCounting = false;
        pause(10);
    }

    //% block="Count from $from to " 
    //% weight=40 
    export function bgCount(from: number, upto: number, tick: number) {
        stopCounting();
        bgValue = from;
        bgStep = (upto > from) ? 1 : -1;
        bgFinal = upto;
        bgCounting = true;

        // initiate counter 
        control.inBackground(function () {
            while (bgCounting) {
                showMeter(bgValue);
                if (bgValue = bgFinal) {
                    bgbgCounting = false;
                } else {
                    bgValue += bgStep;
                }
                pause(tick);
            }
        });
    }

    // a digit is a bitmap (0...1023) encodes two adjacent columns vertically:  
    //           1    32   
    //           2    64 
    //           4   128 
    //           8   256 
    //          16   512 
    // 
    function showDigits(value: number) {
        basic.clearScreen();
        basic.pause(50);
        let bitmap = digitMaps[~~(value / 10)];
        for (let x = 0; x < 5; x++) {
            if (x == 2) {
                bitmap = digitMaps[value % 10];
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
