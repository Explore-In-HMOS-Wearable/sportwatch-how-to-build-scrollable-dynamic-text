import device from '@system.device';

let DEFAULT_WIDTH = 454;
let WIDTH_PERCENT = 0.9;
let AVG_CHAR_RATIO = 0.6;

function calculateCharLimit(usableWidthPx, fontSizePx) {
    let avgCharWidth = fontSizePx * AVG_CHAR_RATIO;
    let limit = Math.floor(usableWidthPx / avgCharWidth);
    if (!limit || limit < 1) {
        limit = 1;
    }
    return limit;
}

function splitWords(text) {
    let raw = text.split(' ');
    let words = [];
    let i;
    for (i = 0; i < raw.length; i++) {
        if (raw[i].length > 0) {
            words.push(raw[i]);
        }
    }
    return words;
}

function wrapTextIntoLines(text, charLimit) {
    let words = splitWords(text);
    let lines = [];
    let currentLine = '';
    let i;
    let word;
    let candidate;
    let remaining;

    for (i = 0; i < words.length; i++) {
        word = words[i];

        if (word.length > charLimit) {
            if (currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = '';
            }
            remaining = word;
            while (remaining.length > charLimit) {
                lines.push(remaining.substring(0, charLimit));
                remaining = remaining.substring(charLimit);
            }
            currentLine = remaining;
            continue;
        }

        if (currentLine.length > 0) {
            candidate = `${currentLine} ${word}`;
        } else {
            candidate = word;
        }

        if (candidate.length <= charLimit) {
            currentLine = candidate;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    return lines;
}

function buildItems(text, deviceWidthPx, fontSizePx) {
    let usableWidth = deviceWidthPx * WIDTH_PERCENT;
    let charLimit = calculateCharLimit(usableWidth, fontSizePx);
    let lines = wrapTextIntoLines(text, charLimit);
    let items = [];
    let i;
    for (i = 0; i < lines.length; i++) {
        items.push({ id: i, value: lines[i] });
    }
    items.push({id: lines.length + 1, value: ""})
    items.push({id: lines.length + 2, value: ""})
    return items;
}

export default {
    data: {
        title: 'Title',
        fontSizePx: 20,
        paragraphText: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.',
        items: []
    },

    onInit() {
        let self = this;

        self.items = buildItems(self.paragraphText, DEFAULT_WIDTH, self.fontSizePx);

        device.getInfo({
            success: function (info) {
                console.info(`windowWidth: ${info.windowWidth}`);
                let width = info.windowWidth;
                if (!width || width <= 0) {
                    width = DEFAULT_WIDTH;
                }
                self.items = buildItems(self.paragraphText, width, self.fontSizePx);
            },
            fail: function (data, code) {
                console.error(`device.getInfo failed, code: ${code}`);
            }
        });
    }
};