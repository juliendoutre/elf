export const formatAddress = (address: number, class_: 32 | 64): string => {
    return `0x${address.toString(16).padStart(class_ == 32 ? 8 : 16, '0')}`;
};

export const formatBytes = (bytesNumber: number): string => {
    if (bytesNumber <= 0) {
        return '0 b';
    }

    let k = 1024;
    let sizes = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];
    let i = Math.floor(Math.log(bytesNumber) / Math.log(k));

    return parseFloat((bytesNumber / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const formatMap = (rows: Map<string, string>, maxWidth: number): string => {
    let longestKey = Array.from(rows.keys()).reduce((acc, key) => {
        if (key.length > acc) {
            return key.length;
        } else {
            return acc;
        }
    }, 0);

    let map = ``;
    rows.forEach((value, key, _) => {
        map += `${key.padEnd(longestKey)}${value.padStart(maxWidth - longestKey)}\n`;
    });

    return map;
};

export const formatTable = (data: Array<Array<string>>): string => {
    if (data.length <= 0) {
        return '';
    }

    let maxWidths = new Array<number>(data[0].length);
    maxWidths.fill(0);

    data.forEach((row) => {
        row.forEach((value, i) => {
            if (value && value.length > maxWidths[i]) {
                maxWidths[i] = value.length;
            }
        });
    });

    let table = '';

    data.forEach((row) => {
        let line = '';

        row.forEach((value, i) => {
            if (value) {
                line += value.padEnd(maxWidths[i] + 2);
            } else {
                line += ''.padEnd(maxWidths[i] + 2);
            }
        });

        table += line;
        table += '\n';
    });

    return table;
};
