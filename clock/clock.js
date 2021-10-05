var MS = MS || {};
MS.Clock = function () {
    var self = this;
    var offset = 0;
    var result;
    self.setHourOffset = function(value){
        offset = value;
        return self;
    };
    self.setResult = function () {
        var cDate = new Date();
        var cZeroDate = new Date(cDate.getUTCFullYear(),cDate.getUTCMonth(),cDate.getDate(),cDate.getUTCHours(),cDate.getUTCMinutes(),cDate.getUTCSeconds());
        var cZeroTime = cZeroDate.getTime();
        var offsetTime = offset*60*60*1000;
        var offsetDate = new Date(cZeroTime + offsetTime);
        result = offsetDate.toLocaleString();
        return self;
    };
    self.getResult = function () {
        return result;
    };
};
