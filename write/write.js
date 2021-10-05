var MS = MS || {};
MS.Write = function () {
    var self = this;
    var parent;
    var workspaceTemplate = document.getElementsByClassName('writing-workspace')[0];
    var popupTemplate = document.getElementsByClassName('popup')[0];
    var shStatus = 0;
    var success = 0;
    var failure = 0;
    var option;
    function random(min,max){
        return Math.floor(Math.random() * (max - min +1)) + min;
    }
    function replace(letters,letter){
        var max = letters.length-1;
        var shallIndex = random(0,max);
        if(letters[shallIndex] === ' '){
            shallIndex = random(0,max);
        }
        letters[shallIndex] = letter;
        return letters;
    }
    function miss(letters){
        return replace(letters,'...');
    }
    function randomise(letters){
        var max = letters.length-1;
        var shallIndex = random(0,max);
        var nShallIndex = shallIndex+1;
        if(letters[nShallIndex] === undefined){
            nShallIndex = shallIndex-1;
        }
        var l1 = letters[shallIndex];
        var l2 = letters[nShallIndex];
        letters[shallIndex] = l2;
        letters[nShallIndex] = l1;
        return letters;
    }
    function mistake(letters){
        var replacements = 'abcdefghijklmnopqrstuvwxyz'.split('');
        var max = replacements.length-1;
        var shallIndex = random(0,max);
        return replace(letters,replacements[shallIndex]);
    }
    self.setParent = function (value) {
        parent = value;
        return self;
    };
    self.setOption = function(value){
        option = value;
        return self;
    };
    self.setResult = function () {
        var triggers = parent.getElementsByClassName('wr');
        var stageProgress = new MS.StageProgress()
            .setParent(document)
            .setTotal(triggers.length)
            .setOnReset(function(){
                success = 0;
                failure = 0;
                new MS.ForEach()
                    .setCollection(triggers)
                    .setResult(function (index, btn) {
                        btn.classList.remove('s1');
                        btn.classList.remove('s2');
                    });
            })
            .setResult();
        new MS.ForEach()
            .setCollection(triggers)
            .setResult(function (index, trigger) {
                var parentN = trigger.parentNode.parentNode;
                var shallLetterStrings = [];
                var trueText = '';
                var falseText = '';
                var hrefs = parentN.getElementsByTagName('a');
                new MS.ForEach()
                    .setCollection(hrefs)
                    .setResult(function (index, href) {
                        var thisShallLetterStrings = href.textContent.split('');
                        shallLetterStrings = shallLetterStrings.concat(thisShallLetterStrings);
                        trueText += href.textContent;
                        var falseTextContent = '';
                        switch (option) {
                            case 'default':
                                break;
                            case 'missing letter':
                                falseTextContent += miss(thisShallLetterStrings).join('');
                                break;
                            case 'randomised letters':
                                falseTextContent += randomise(thisShallLetterStrings).join('');
                                break;
                            case 'mistaken letter':
                                falseTextContent += mistake(thisShallLetterStrings).join('');
                                break;
                        }
                        if(falseTextContent !== ''){
                            href.textContent = falseTextContent;
                            falseText += falseTextContent;
                        }
                    });
                MS.Events().addClick(trigger, function (event) {
                    if(trigger.classList.length === 1){
                        var result = 0;
                        var repetitionCount = 0;
                        parentN.classList.add('s1');
                        var form = workspaceTemplate.cloneNode(true);
                        var repetition = form.children[0];
                        var tracking = form.children[1];
                        var input = form.children[2];
                        var help = form.children[3];
                        var helpShowTrigger = help.children[0];
                        var helpText = help.children[1];
                        if(option === 'default'){
                            helpText.textContent = trueText;
                        } else {
                            helpText.textContent = falseText;
                        }
                        var originalPlaceHolderText = input.getAttribute('data-placeholder');
                        var placeHolder = new MS.PlaceHolder()
                            .setElement(input)
                            .setText(originalPlaceHolderText)
                            .setResult();
                        trigger.classList.add('s'+result);
                        var popup = new MS.Popup()
                            .setTemplate(popupTemplate)
                            .setOnUnsetResult(function () {
                                if(result > 0){
                                    trigger.classList.add('s'+result);
                                    if(result === 1){
                                        stageProgress.setSuccess(++success);
                                    } else {
                                        stageProgress.setFailure(++failure);
                                    }
                                    stageProgress.setResult();
                                }
                                trigger.classList.remove('s0');
                                parentN.classList.remove('s1');
                                repetitionCount = 0;
                            })
                            .setContent(form)
                            .setResult(function (foreground) {});
                        MS.Events()
                            .addFocus(input, function (event) {
                                placeHolder.unsetResult();
                                if(shStatus === 1){
                                    shStatus = 0;
                                    MS.Events().produceClick(helpShowTrigger);
                                }
                            });
                        MS.Events()
                            .addBlur(input, function (event) {
                                placeHolder.setResult();
                            });
                        MS.Events()
                            .addKeyUp(input, function (event) {
                                tracking.innerHTML = '';
                                if(input.textContent !== ''){
                                    var isContent = input.textContent.replace(/\s+/g, ' ').replace('.',' .').trim();
                                    var areLetterStrings = isContent.split('');
                                    new MS.ForEach()
                                        .setCollection(areLetterStrings)
                                        .setResult(function (index, isLetter) {
                                            var part = document.createElement('div');
                                            var selected = isLetter === shallLetterStrings[index] ? '1' : '2';
                                            result = 4;
                                            part.classList.add('s'+selected);
                                            part.textContent = isLetter;
                                            tracking.appendChild(part);

                                        });
                                    console.log(areLetterStrings);
                                    console.log(shallLetterStrings);
                                    if (JSON.stringify(areLetterStrings) === JSON.stringify(shallLetterStrings)) {
                                        tracking.innerHTML = '';
                                        input.textContent = '';
                                        window.service.audio.pause();
                                        window.service.audio = new Audio();
                                        window.service.audio.src = '/Dummy/Style/correct.mp3';
                                        window.service.audio.play();
                                        repetition.children[repetitionCount].classList.add('s1');
                                        repetitionCount = repetitionCount+1;
                                        result = 0;
                                        if(repetitionCount === 3){
                                            result = 1;
                                            input.textContent = input.getAttribute('data-success');
                                            input.removeAttribute('contenteditable');
                                            tracking.innerHTML = '';
                                            window.setTimeout(function(){
                                                popup.unsetResult();
                                            },2000);
                                        }
                                    } else {
                                        var dots = document.createTextNode('...');
                                        tracking.appendChild(dots);
                                        result = 0;
                                    }
                                }
                            });
                        var manager = new MS.Relations();
                        var relation = new MS.Relation()
                            .setActivator(helpShowTrigger)
                            .addDependant(helpText);
                        manager.addRelation(relation);
                        MS.Events().addClick(helpShowTrigger, function (event) {
                            manager.setEvent(event);
                            manager.setResult(function (selected) {
                                if(selected === true){
                                    shStatus = 1;
                                    input.textContent = '';
                                    tracking.innerHTML = '';
                                    MS.Events()
                                        .produceKeyUp(input)
                                        .produceBlur(input);
                                } else {
                                    shStatus = 0;
                                }
                            });
                        });
                    }
                });
            });
        return self;
    };
};
