MS = MS || {};
MS.SpeechSynthesis = function(){
    "use strict";
    var self = this;
    if (typeof window.speechSynthesis === 'undefined') {
        return;
    }
    var synthesis = window.speechSynthesis;
    var pitch = 1;
    var rate = 1;
    var text = '';
    var language = 'en-GB';
    var volume = 0.5;
    var onStart = {};
    var onEnd = {};
    self.setPitch = function(value){
        pitch = parseFloat(value);
        return self;
    };
    self.setRate = function(value){
        rate = parseFloat(value);
        return self;
    };
    self.setLanguage = function(value){
        language = value;
        return self;
    };
    self.setVolume = function(value){
        volume = parseFloat(value);
        return self;
    };
    self.setText = function(value){
        text = value;
        return self;
    };
    self.setResult = function(eventObject){
        if (synthesis.speaking === true) {
            return;
        }
        if (text !== '') {
            var utterance = new SpeechSynthesisUtterance();
            utterance.text = text;
            utterance.pitch = pitch;
            utterance.rate = rate;
            utterance.onboundry = function (event) {};
            utterance.onstart = function (event) {
                eventObject.onStart.call(synthesis);
            };
            utterance.onend = function (event) {
                eventObject.onEnd.call(synthesis);
            };
            utterance.onerror = function (event) {};
            utterance.onmark = function (event) {};
            utterance.onpouse = function (event) {};
            utterance.onresume = function (event) {};
            new MS.ForEach()
                .setCollection(synthesis.getVoices())
                .setResult(function(index,sVoice){
                    if(sVoice.lang === language){
                        utterance.voice = sVoice;
                        return false;
                    }
                });
            synthesis.speak(utterance);
        }
        return self;
    };
    self.setPause = function(){
        synthesis.pause();
        return self;
    };
    self.setResume = function(){
        synthesis.resume();
        return self;
    };
    self.setCancel = function(){
        synthesis.cancel();
        return self;
    };
    self.getIsSpeaking = function(){
        return synthesis.speaking;
    };
    self.getIsPending = function(){
        return synthesis.pending;
    };
    self.getIsPaused = function(){
        return synthesis.paused;
    };
};