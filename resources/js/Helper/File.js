class FileHelper {

    static fileSizeH(size, precision = 1) {

        let base = 0;
        if (size > 0) {
            base = Math.log(size) / Math.log(1000);
            size = Math.pow(1000, base - Math.floor(base)).toFixed(precision);
        }
        return [size, FileHelper.fileSizeSuffix[Math.floor(base)]].join(' ');
    }
}

Object.defineProperty(FileHelper, 'fileSizeSuffix', {
    value: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
    writable: false,
    configurable: false,
    enumerable: false
})

export default FileHelper