var MS = MS || {};
MS.CalendarEvent = function () {
    var self = this;
    var parent;
    var url;
    var thisCallback = function(){};
    self.setParent = function (value) {
        parent = value;
        return self;
    };
    self.setUrl = function (value) {
        url = value;
        return self;
    };
    self.setResult = function (callback) {
        if(typeof callback !== 'function'){
            thisCallback = function(){};
        }
        var inputs = parent.getElementsByClassName('ce');
        var communication = window.service.communication;
        new MS.ForEach()
            .setCollection(inputs)
            .setResult(function (index, input) {
                new MS.Events().addBlur(input, function (event) {
                    var dateTime = input.textContent.trim();
                    if(dateTime !== ''){
                        var oToday = new Date();
                        var originalDateTime = input.getAttribute('data-o');
                        /**
                         * isTheSameAsBefore
                         */
                        if(dateTime !== originalDateTime){
                            try {
                                var oDate = new Date(dateTime);
                                /**
                                 * isAcceptedIncrement
                                 */
                                var minutes = oDate.getMinutes();
                                if(!isNaN(minutes)){
                                    if(minutes === 0 || minutes === 30){
                                        /**
                                         * isInTheFuture + 2h
                                         */
                                        oToday.setHours(oToday.getHours() + 2);
                                        if(oDate.getTime() > oToday.getTime()){
                                            /**
                                             * isDuplicate
                                             */
                                            var isDuplicate = false;
                                            new MS.ForEach()
                                                .setCollection(inputs)
                                                .setResult(function (index1, input1) {
                                                    var dateTime1 = input1.textContent.trim();
                                                    if(index !== index1 && dateTime === dateTime1){
                                                        isDuplicate = true;
                                                        return false;
                                                    }
                                                });
                                            if(isDuplicate === true){
                                                throw new Error('this date & time is already inserted in another box');
                                            } else {
                                                var uri = input.getAttribute('href');
                                                var data = new FormData();
                                                data.append('s',window.service.postHash);
                                                data.append('date',dateTime);
                                                new MS.XmlHttpRequest()
                                                    .unsetAsynchronous()
                                                    .setPostData(data)
                                                    .setUrl(uri)
                                                    .setResult(function (XmlHttpResponse) {
                                                        if (XmlHttpResponse.getResult() === true) {
                                                            if (XmlHttpResponse.getSuccess() !== null) {
                                                                var href = XmlHttpResponse.getSuccess();
                                                                input.setAttribute('href',href);
                                                                input.setAttribute('data-o',dateTime);
                                                                thisCallback.call(this);
                                                            } else if (XmlHttpResponse.getFailure() !== null) {
                                                                alert(XmlHttpResponse.getFailure());
                                                            }
                                                            window.service.postHash = XmlHttpResponse.getPostsHash();
                                                        } else {
                                                            console.log(XmlHttpResponse.getResult());
                                                        }
                                                    });
                                            }
                                        } else {
                                            throw new Error('date & time have to be in the future');
                                        }
                                    } else {
                                        throw new Error('accepted increment: 30 min');
                                    }
                                } else {
                                    throw new Error('input value has to be a valid date & time');
                                }
                            } catch(error){
                                communication.setType(communication.TYPE_FAILURE)
                                    .setContents(error.message)
                                    .setResult();
                            }
                        }
                    }
                });
                new MS.Events().addKeyUp(input, function (event) {
                    var key = new MS.Keyboard()
                        .setEvent(event)
                        .setResult();
                    if (key.isEnter() === true) {
                        MS.Events().produceBlur(input);
                    }
                });
            });
        return self;
    };
};
