class CommonTools {
    public static ConsoleLog(message: string, data: Array<any>, isBold: boolean = false, color: string = null) {
        var style = '';
        if (isBold) {
            style += 'font-weight:bold; '
        }
        if (color != null) {
            style += 'color:' + color + '; ';
        }
        if (style != '') {
            console.log('%c' + message, style, data);
        } else{
            console.log(message, data);
        }
    }
}