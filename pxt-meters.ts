// M E T E R S  -  Dials, Bars and Counters 
enum STYLES {
    //% block="Blob [0..5]"
    BLOB,
    //% block="Bar [0..15]" 
    BAR,
    //% block="Dial [0..24]" 
    DIAL,
    //% block="Needle [0..17]"
    NEEDLE,
    //% block="Tide [0..25]"
    TIDE,
    //% block="Counter [0..99]" 
    COUNTER
}
/* DIAL - 24 radial positions of a pointer.
    
    For each angle, we use three pixels: centre---pixel1---pixel2
    Each 4-digit value ABCD encodes coords of pixel1(A,B); pixel2(C,D)

    const dialData = [
        2120, 2130, 3130, 3140, 3141, 3241,
        3242, 3243, 3343, 3344, 3334, 2334,
        2324, 2314, 1314, 1304, 1303, 1203,
        1202, 1201, 1101, 1100, 1110, 2110];

Now re-coded as full 25-bit bit-maps:
*/
const dialMaps = [
    0x0001C00, 0x0009800, 0x0019000, 0x0111000, 0x0211000, 0x0221000,
    0x0421000, 0x0821000, 0x0841000, 0x1041000, 0x00C1000, 0x0083000,
    0x0007000, 0x0003200, 0x0001300, 0x0001110, 0x0001108, 0x0001088,
    0x0001084, 0x0001082, 0x0001042, 0x0001041, 0x0001060, 0x0001820];

const dialBound = 24;


/* DIGITAL - 2-digit readout from 0 to 99

    Each digit uses a 10-bit bitmap (0...1023) encoding pixels vertically 
    from 2 adjacent display columns, either {0,1} or{3,4}:  
        2^0=1   2^5=32 
        2^1=2   2^6=64 
        2^2=4   2^7=128 
        2^4=8   2^8=256 
        2^5=16  2^9=512 
    the full 2-digit map is tensMap + (unitsMap << 15) 
*/
const digitMaps = [
    0x1CE,  // 462,  //"0" 
    0x3E0,  // 992,  //"1" 
    0x2FD,  // 765,  //"2" 
    0x3F5,  // 1013, //"3" 
    0x38F,  // 911,  //"4" 
    0x3B7,  // 951,  //"5" 
    0x39F,  // 927,  //"6" 
    0x3E1,  // 993,  //"7" 
    0x37B,  // 891,  //"8" 
    0x3E7]; // 999   //"9" 
const digitBound = 100;

/*   NEEDLE - 17 positions showing 90-degree sweep from a corner
Each 8-digit value ABCDEFGH encodes coords of four pixels:
pixel1(A,B); pixel2(C,D); pixel3(E,F); pixel4(G,H)
in addition to pixel(0,0), which is always on.

Now re-coded as full 25-bit bit-maps:
*/
const needleMaps = [
    0x0108421,  //  0 ----
    0x0208421,  //  1 -
    0x0210421,  //  2 --
    0x0210841,  //  3 -
    0x0410841,  //  4 ---
    0x0420841,  //  5 -
    0x0820841,  //  6 --
    0x0821041,  //  7 -
    0x0041041,  //  8 ----
    0x0083041,  //  9 -
    0x00820C1,  // 10 --
    0x00060C1,  // 11 -
    0x00041C1,  // 12 ---
    0x0000383,  // 13 -
    0x0000307,  // 14 --
    0x000020F,  // 15 -
    0x000001F]; // 16 ----
const needleBound = 17;

/*   BLOB - disc expanding from centre

const blobData = [
    55555522,
    21123224,
    11311333,
    20024224,
    10410334,
    30014314,
    00400444];
const blobBound = 8;
*/

//% color=#402080 weight=100 icon="\uf118" block="Meters" 
namespace Meter {
    let fromValue: number = 0;   // the user's start value
    let uptoValue: number = 0;   // the user's end $value
    let valueNow: number = 0;    // the user's latest value
    let styleIs: number = STYLES.DIAL;
    let mapSet: number[] = dialMaps;
    let bound: number = dialBound; // number of displayable "frames" for ths style
    let frame: number = -1;    // currently displayed frame (-1 says none)
/* We save bit-maps of the pixels currently lit, and needing to be lit:
  Computing (litMap XOR newMap) then shows which pixels will need to be toggled.
  Bits are allocated column-wise top-to-bottom and left-to-right,
  so pixel[x,y] contributes 2**(x*5 + y) to the 25-bit map.
  (This matches the 2-column encoding used for each digit in STYLE.COUNTER)
*/
    let litMap: number = 0;
    let newMap: number = 0;

    let bgFlashing = false; // notify overflow/underflow
    let bgCounting = false; // animate intermediate frames



// toggle the state of all pixels indicated in the 25-bit map toToggle
    function toggle(toToggle:number) {
        let bitmap = toToggle;
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (bitmap & 1) {
                    led.toggle(x, y);
                } 
                bitmap >>= 1;
            }
        }
    }

    // EXPOSED USER INTERFACES  

    //% block="Use %choice meter to show values from $start to $limit" 
    //% weight=20 
    export function useMeter(style: STYLES, start: number, limit: number) {
        styleIs = style;
        fromValue = start;
        uptoValue = limit;
        // leave these set as default for unimplemented STYLES
        mapSet = dialMaps;
        bound = dialBound;

        switch (styleIs) {
            case STYLES.DIAL:
                break;
            case STYLES.COUNTER:
                mapSet = digitMaps;   // NOTE: only 10 frames!
                bound = digitBound; // ...combine to allow 100 values
                break;
            case STYLES.NEEDLE:
                mapSet = needleMaps;
                bound = needleBound;
                break;
        }
        basic.clearScreen();
        litMap = 0;
        showValue(start);
    }

    //% block="Show Value= $value" 
    //% weight=30 
    export function showValue(value: number) {      
        // map value onto display range
        frame = Math.map(value, fromValue, uptoValue, 0, bound);
        if (frame < 0) {
            bgFlashing = true; // underflow
            frame = 0;
        }
        if (frame > bound) {
            bgFlashing = true; // overflow
            frame = bound;
        }
        if (styleIs == STYLES.COUNTER) {
            let tens = ~~(value / 10);
            let units = value % 10;
            // shift "units" map by 3 columns (=15 bits) over to right side
            // then add-in "tens" map to occupy left 2 columns
            newMap = (mapSet[units] << 15) + mapSet[tens];
        } else {
            newMap = mapSet[frame];
        }
        let toToggle = litMap | newMap;   // see which pixels differ
        toggle(toToggle);
        litMap = newMap;
        valueNow = value;
    }

    //% block="Stop bgCounting" 
    //% weight=40 
    export function stopbgCounting() {
        bgCounting = false;
        pause(10);
    }

    //% block="Change meter to $value over $ms ms" 
    //% weight=40 
    export function changeMeter(value: number, ms: number) {
        /*
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
        */
    }
}

Meter.useMeter(STYLES.DIAL,10,23);
for (let i = 10; i < 24; i++) {
    Meter.showValue(i);
    basic.pause(500);
}