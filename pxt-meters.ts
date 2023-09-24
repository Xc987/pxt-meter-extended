// M E T E R S  
enum STYLES {
    //% block="Blob"
    BLOB,
    //% block="Spiral"
    SPIRAL,
    //% block="Bar" 
    BAR,
    //% block="Dial" 
    DIAL,
    //% block="Needle"
    NEEDLE,
    //% block="Tidal"
    TIDAL
}

/* Default style is DIGITAL: a 2-digit readout from 0 to 99
    Each digit uses a 10-bit bitmap (0...1023) encoding pixels vertically
    from 2 adjacent display columns, either {0,1} or{3,4}:
        2^0=1   2^5=32
        2^1=2   2^6=64
        2^2=4   2^7=128
        2^4=8   2^8=256
        2^5=16  2^9=512
    combined as ((tensMap << 15) + unitsMap) to give a full bitmap 
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
const digitBound = 99;
const digitStyle = -1;

/* displayed frames are coded column-wise from top-left as 25-bit bit-maps:
*/
// DIAL: 24 frames rotate 3-pixel pointer about middle
const dialMaps = [
    0x0001C00, 0x0009800, 0x0019000, 0x0111000, 0x0211000, 0x0221000,
    0x0421000, 0x0821000, 0x0841000, 0x1041000, 0x00C1000, 0x0083000,
    0x0007000, 0x0003200, 0x0001300, 0x0001110, 0x0001108, 0x0001088,
    0x0001084, 0x0001082, 0x0001042, 0x0001041, 0x0001060, 0x0001820];
const dialBound = 23;

// BLOB: 7 frames growing outwards from middle
const blobMaps = [
    0x0001000, 0x0023880, 0x00739C0, 0x0477DC4,
    0x06F7DEC, 0x0EFFFEE, 0x1FFFFFF];
const blobBound = 6;

// BAR: 15 frames of vertical bar-graph  
const barMaps = [
    0x0004000, 0x0084200, 0x1084210, 0x1086210, 0x10C6310, 0x18C6318,
    0x18C7318, 0x18E7398, 0x1CE739C, 0x1CE7B9C, 0x1CF7BDC, 0x1EF7BDE,
    0x1EF7FDE, 0x1EFFFFE, 0x1FFFFFF];
const barBound = 14;

// SPIRAL: 25 frames winding outwards from middle
const spiralMaps = [
    0x0001000, 0x0021000, 0x0061000, 0x0063000, 0x0063100, 0x0063180,
    0x00631C0, 0x00639C0, 0x00739C0, 0x02739C0, 0x06739C0, 0x0E739C0,
    0x1E739C0, 0x1EF39C0, 0x1EF79C0, 0x1EF7BC0, 0x1EF7BD0, 0x1EF7BD8,
    0x1EF7BDC, 0x1EF7BDE, 0x1EF7BDF, 0x1EF7BFF, 0x1EF7FFF, 0x1EFFFFF, 0x1FFFFFF];
const spiralBound = 24;

// TIDAL: 25 frames washing diagonally up from bottom-left corner
const tidalMaps = [
    0x0000010, 0x0000210, 0x0000218, 0x000021C, 0x000031C, 0x000431C,
    0x008431C, 0x008631C, 0x008639C, 0x008639E, 0x008639F, 0x00863DF,
    0x00873DF, 0x00C73DF, 0x10C73DF, 0x18C73DF, 0x18E73DF, 0x18E7BDF,
    0x18E7BFF, 0x18E7FFF, 0x18F7FFF, 0x1CF7FFF, 0x1EF7FFF, 0x1EFFFFF,
    0x1FFFFFF];
const tidalBound = 24;

// NEEDLE: 17 frames swinging clockwise around top-left corner
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
const needleBound = 16;

/*   BLOB - disc expanding from centre

const blobData = [
    55555522,
    21123224,
    11311333,
    20024224,
    10410334,
    30014314,
    00400444];
const blobBound = 7;
*/

//% color=#402080 weight=100 icon="\uf0e4" block="meter" 
namespace meter {
    let styleIs: number = digitStyle;
    let mapSet: number[] = digitMaps; // array of frame bit-maps
    let bound: number = digitBound;   // highest frame-index
    let fromValue: number = 0;     // the user's start value
    let uptoValue: number = 0;     // the user's end $value
    let valueNow: number = 0;      // the user's latest value

    /* We save the bit-maps of the pixels currently lit, and needing to be lit:
      Computing (litMap XOR newMap) then shows which pixels will need to be toggled.
      Bits are allocated column-wise top-to-bottom and left-to-right,
      so pixel[x,y] contributes 2**(x*5 + y) to the 25-bit map.
      (This matches the 2-column encoding used for each digit in digitStyle)
    */
    let litMap: number = 0;
    let newMap: number = 0;
    let litFrame: number = -1; // currently displayed frame (-1 says none)
    let rangeFixed = false;    // notify overflow/underflow
    let flashError = false;    // finalFrame was out of range before correction
    let flashUnlit = false;    // distinguish lit/unlit phase of flashing
    let adjusting = false; // true while adjusting intermediate frames
    let flashing = false;  // true while indicating frameError
    let firstFrame = 0;    // animation start-value
    let finalFrame = 0;    // animation end-value
    let when = 0;          // animation starting time
    let then = 0;          // animation target end time
    let tick = 0;          // animation adjusting interval
    let flashGap = 125;    // flashing around 4 times/sec

    function mapToFrame(value: number, start: number, end: number,
        startFrame: number, endFrame: number): number {
        let result = startFrame;
        let span = end - start;             // (can be negative)
        let frames = endFrame - startFrame; // (can be negative)
        if (span != 0) {
            let frac = (value - start) / span;
            result = startFrame + (frac * frames);
        }
        return result;
    }

    function fixRange(value: number, oneEnd: number, otherEnd: number): number {
        // NOTE side effect: sets rangeFixed true if out-of-range, else clears it
        let bottom = Math.min(oneEnd, otherEnd);
        let top = Math.max(oneEnd, otherEnd);
        let result = value;
        rangeFixed = false;
        if (value < bottom) {
            rangeFixed = true;
            result = bottom;
        }
        if (value > top) {
            rangeFixed = true;
            result = top;
        }
        return Math.round(result)
    }

    // update display to show new frame
    // (frame will always be within the range [0..bound])
    function showFrame(frame: number) {
        if (styleIs == digitStyle) {
            let tens = ~~(frame / 10);
            let units = frame % 10;
            // left-shift "units" map by 3 columns over to right side (=15 bits)
            // then OR-in "tens" map to occupy left 2 columns
            newMap = (mapSet[units] << 15) | mapSet[tens];
        } else {
            newMap = mapSet[frame];
        }
        // see which pixels differ
        let toToggle = newMap ^ litMap;
        toggleColumnMap(toToggle);
        litMap = newMap;
        litFrame = frame;
    }

    // toggle the state of all pixels indicated in the 25-bit column-map: toToggle
    function toggleColumnMap(toToggle: number) {
        let bitmap = toToggle;
        for (let x = 0; x < 5; x++) { // column-wise from top-left
            for (let y = 0; y < 5; y++) {
                if (bitmap & 1) {
                    led.toggle(x, y);
                }
                bitmap >>= 1;
            }
        }
    }

    function clearFrame() {
        basic.clearScreen();
        litMap = 0;
        // litFrame = -1;
    }

    function flash(): void {
        basic.pause(flashGap);
        if (litMap != 0) {
            clearFrame();
            flashUnlit = true; // forces re-display when flashing interrupted
        } else {
            showFrame(finalFrame);
            flashUnlit = false;
        }
    }

    // perform background tasks: adjusting the meter gradually and/or flashing range-error
    function animate(): void {
        while (adjusting) {
            let now = input.runningTime();
            // can't predict interrupts, so: where should we have got to by now?
            let nextFrame = mapToFrame(now, when, then, firstFrame, finalFrame);
            // NOTE: will exceed finalFrame if we're late to complete
            nextFrame = fixRange(nextFrame, 0, bound); // could set rangeFixed
            showFrame(nextFrame);
            if (nextFrame == finalFrame) {  // we've arrived!
                adjusting = false;
            } else {
                pause(tick);
            }
        }
        // if animations got halted prematurely, litFrame shows where we got to
        // which will always be within bounds, so forget about flashing
        if (litFrame != finalFrame) {
            flashError = false;
        }
        // now any adjusting is complete, start flashing range-error if needed
        while (flashError || flashUnlit) {
            flash(); // always leave finalFrame lit
        }
    }

    // EXPORTED USER INTERFACES  

    //% block="Use digital meter to indicate values from 0 to 99" 
    //% weight=100 
    export function digital() {
        styleIs = digitStyle;
        fromValue = 0;
        uptoValue = 99;
        mapSet = digitMaps; // NOTE: the 10 numeric frames!
        bound = digitBound; // ...combine to allow 100 values
        reset();
    }

    //% block="Use %choice meter to show values from $start to $limit" 
    //% start.defl=0
    //% limit.defl=20
    //% weight=90
    export function use(style: STYLES, start: number, limit: number) {
        styleIs = style;
        fromValue = start;
        uptoValue = limit;
        switch (style) {
            case STYLES.DIAL:
                mapSet = dialMaps;
                bound = dialBound;
                break;
            case STYLES.NEEDLE:
                mapSet = needleMaps;
                bound = needleBound;
                break;
            case STYLES.BAR:
                mapSet = barMaps;
                bound = barBound;
                break;
            case STYLES.BLOB:
                mapSet = blobMaps;
                bound = blobBound;
                break;
            case STYLES.SPIRAL:
                mapSet = spiralMaps;
                bound = spiralBound;
                break;
            case STYLES.TIDAL:
                mapSet = tidalMaps;
                bound = tidalBound;
                break;
        }
        styleIs = style;
        reset();
    }

    /** 
     *  Show new value for meter immediately, or adjusting gradually
    */
    //% block="show meter value= $value || , taking $ms ms" 
    //% inlineInputMode=inline
    //% expandableArgumentMode="enabled"
    //% weight=80
    export function show(value: number, ms = 0) {
        stop(); // cease any ongoing animation (leaves any current litFrame lit)
        finalFrame = mapToFrame(value, fromValue, uptoValue, 0, bound);
        finalFrame = fixRange(finalFrame, 0, bound); // NOTE: may set rangeFixed!
        flashError = rangeFixed; // if so, remember the fact
        firstFrame = litFrame; // the inherited start-frame (may be -1 if none)
        if ((ms > 50)       // enough time to adjust gradually?
            && (litFrame != -1) // and there is a current reading?
            && (finalFrame != firstFrame)) { // ...that differs?
            // passes all sanity checks
            adjusting = true;     // adjustment is feasible
            when = input.runningTime();
            then = when + ms;
            tick = Math.round(ms / Math.abs(firstFrame - finalFrame));
        } else {
            adjusting = false;     // adjustment is infeasible...
            showFrame(finalFrame); // so just show final target frame directly
        }
        // perform any required progressive adjustment or error-flashing as a background task
        control.inBackground(function () { animate() })
    }

    //% block="reset meter" 
    //% weight=30 
    export function reset() {
        stop();
        clearFrame();
        showFrame(0);
    }

    //% block="wait for animation" 
    //% weight=20 
    export function wait() {
        while (adjusting) {
            pause(20);
        }
    }

    //% block="stop animation" 
    //% weight=10 
    export function stop() {
        if (adjusting) {
            adjusting = false; //  prematurely stop background adjustment
            basic.pause(tick); // ensure it has happened
        }
        if (flashError) {
            flashError = false; // stop any error-flashing
            basic.pause(2 * flashGap); // ensure it has happened
        }
    }


}
