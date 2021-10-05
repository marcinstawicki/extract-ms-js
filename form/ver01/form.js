var MS = MS || {};
MS.Form = function () {
    "use strict";
    var start = Date.now();
    var self = this;
    var parent;
    var collections;
    var result;

    function setInfoBoxes(labels) {
        new MS.ForEach()
            .setCollection(labels)
            .setResult(function (index, label) {
                if (index > 0) {
                    label.setAttribute('data-a', '1');
                    label.setAttribute('data-e', '0');
                }
            });
    }

    function unsetInfoBoxes(labels) {
        new MS.ForEach()
            .setCollection(labels)
            .setResult(function (index, label) {
                if (index > 0) {
                    label.setAttribute('data-a', '0');
                    label.setAttribute('data-e', '0');
                }
            });
    }

    function setPlaceholder(object, text) {
        if (object.nodeName === 'INPUT') {
            if (object.value === '') {
                object.value = text;
            }
        } else {
            if (object.textContent === '') {
                object.textContent = text;
            }
        }
    }

    function unsetPlaceholder(object, text) {
        if (object.nodeName === 'INPUT') {
            if (object.value === text) {
                object.value = '';
            }
        } else {
            if (object.textContent === text) {
                object.textContent = '';
            }
        }
    }

    function setTextManager(type, unit, editionTrigger, info, collection) {
        MS.Events().addMouseLeave(unit, function (e) {
            new MS.ForEach()
                .setCollection(collection.children)
                .setResult(function (index, input) {
                    var realInput = input.children[2];
                    MS.Events().produceBlur(realInput);
                    var placeHolderText = realInput.getAttribute('data-p');
                    if (placeHolderText !== null) {
                        unsetPlaceholder(realInput, placeHolderText);
                    }
                });
            unsetInfoBoxes(info.children);
        });
        new MS.ForEach()
            .setCollection(collection.children)
            .setResult(function (index, input) {
                var realInput = input.children[1];
                var placeHolderText = realInput.getAttribute('data-p');
                if (placeHolderText !== null) {
                    setPlaceholder(realInput, placeHolderText);
                }
                MS.Events().addFocus(realInput, function (e) {
                    var placeHolderText = realInput.getAttribute('data-p');
                    if (placeHolderText !== null) {
                        unsetPlaceholder(realInput, placeHolderText);
                    }
                    setInfoBoxes(info.children);
                });
                MS.Events().addBlur(realInput, function (e) {});
                if (type === 'text-suggestion') {
                    var parts = window.service.suggestionUri.split('?');
                    var path = parts[0].replace('suggestion', '');
                    MS.Events().addKeyUp(input, function (event) {
                        document.cookie = 'suggestion=' + input.value + '; expires=; path=' + path + ';';
                        var loading = new MS.Loading()
                            .setElement(input)
                            .setStart();
                        new MS.XmlHttpRequest()
                            .setUrl(window.service.suggestionUri)
                            .setResult(function (XmlHttpResponse) {
                                if(XmlHttpResponse.getResult() === true){
                                    if (XmlHttpResponse.getSuccess() !== null) {
                                        loading.setFinish();
                                        new MS.Suggestion()
                                            .setElements(XmlHttpResponse.getSuccess())
                                            .setEvent(event)
                                            .setInput(this)
                                            .setResult(function () {
                                            });
                                    } else if (XmlHttpResponse.getFailure() !== null) {

                                    }
                                } else {
                                    console.log(XmlHttpResponse.getResult());
                                }
                            });
                        document.cookie = 'suggestion=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + ';';
                    });
                }
            });
    }

    function setFileManager(type, unit, editionTrigger, info, collection) {
        MS.Events().addMouseLeave(unit, function (e) {
            new MS.ForEach()
                .setCollection(collection.children)
                .setResult(function (index, input) {
                    var realInput = input.children[1];
                    MS.Events().produceBlur(realInput);
                });
            unsetInfoBoxes(info.children);
        });
        new MS.ForEach()
            .setCollection(collection.children)
            .setResult(function (index, input) {
                var realInput = input.children[1];
                MS.Events().addBlur(realInput, function (e) {
                });
                MS.Events().addChange(realInput, function () {
                    input.textContent = this.files[0].name;
                });
                MS.Events().addClick(editionTrigger, function () {
                    MS.Events().produceClick(realInput);
                });
            });
    }

    function setDatetimeManager(type, unit, editionTrigger, info, collection) {
        MS.Events().addMouseLeave(unit, function (e) {
            new MS.ForEach()
                .setCollection(collection.children)
                .setResult(function (index, input) {
                    var realInput = input.children[2];
                    MS.Events().produceBlur(realInput);
                    var placeHolderText = realInput.getAttribute('data-p');
                    if (placeHolderText !== null) {
                        unsetPlaceholder(realInput, placeHolderText);
                    }
                });
            unsetInfoBoxes(info.children);
        });
        new MS.ForEach()
            .setCollection(collection.children)
            .setResult(function (index, input) {
                var realInput = input.children[2];
                var placeHolderText = realInput.getAttribute('data-p');
                if (placeHolderText !== null) {
                    setPlaceholder(realInput, placeHolderText);
                }
                MS.Events().addFocus(realInput, function (e) {
                    var placeHolderText = realInput.getAttribute('data-p');
                    if (placeHolderText !== null) {
                        unsetPlaceholder(realInput, placeHolderText);
                    }
                    setInfoBoxes(info.children);
                    var calendar = new MS.CalendarJs();
                    calendar.setInput(this)
                        .setType(type)
                        .setParent(collection)
                        .setResult();
                });
                MS.Events().addBlur(realInput, function (e) {
                });
            });
    }

    function setSelectManager(type, unit, editionTrigger, info, collection, search) {
        var leave = false;
        var manager = new MS.Relations();
        MS.Events().addMouseLeave(unit, function () {
            if (leave === true) {
                MS.Events().produceClick(editionTrigger);
                leave = false;
            }
        });
        var relation = new MS.Relation()
            .setActivator(editionTrigger)
            .addDependant(collection);
        manager.addRelation(relation);
        MS.Events().addClick(editionTrigger, function (event) {
            manager.setEvent(event);
            manager.setResult(function (selected) {
                if (selected === true) {
                    leave = true;
                    setInfoBoxes(info.children);
                    new MS.ForEach()
                        .setCollection(collection.children)
                        .setResult(function (index, input) {
                            input.setAttribute('data-a', 1);
                        });
                    if (search !== null) {
                        search.setAttribute('data-a', 1);
                    }
                } else {
                    leave = false;
                    unsetInfoBoxes(info.children);
                    if (search !== null) {
                        search.innerHTML = '';
                        search.setAttribute('data-a', 0);
                        MS.Events().produceKeyUp(search);
                        MS.Events().produceBlur(search);
                    }
                    new MS.ForEach()
                        .setCollection(collection.children)
                        .setResult(function (index, input) {
                            var realInput = input.children[1];
                            var selected = realInput.getAttribute('data-s');
                            if (selected === '0') {
                                input.setAttribute('data-a', '0');
                            }
                        });
                }
            });
        });
        var maxQuantity = collection.getAttribute('data-m');
        new MS.ForEach()
            .setCollection(collection.children)
            .setResult(function (index, input) {
                MS.Events().addClick(input.children[1], function () {
                    var count = 0;
                    var firstSelected;
                    new MS.ForEach()
                        .setCollection(collection.children)
                        .setResult(function (index1, input) {
                            var option = input.children[1];
                            var selected = option.getAttribute('data-s');
                            if (selected === '1') {
                                if (typeof firstSelected === 'undefined') {
                                    firstSelected = option;
                                }
                                count++;
                            }
                        });
                    var selected = this.getAttribute('data-s');
                    if (selected === '0') {
                        this.setAttribute('data-s', 1);
                        this.nextElementSibling.removeAttribute('disabled');
                        if (count >= maxQuantity && typeof firstSelected !== 'undefined') {
                            firstSelected.setAttribute('data-s', 0);
                            firstSelected.nextElementSibling.setAttribute('disabled', 'disabled');
                        }
                    } else {
                        this.setAttribute('data-s', 0);
                        this.nextElementSibling.setAttribute('disabled', 'disabled');
                    }
                    if (++count >= maxQuantity) {
                        MS.Events().produceClick(editionTrigger);
                    }
                });
            });
    }

    function setMenuManager(trigger, input) {
        //create menu and add buttons and events
        MS.Events().addClick(control, function (e) {
            new MS.Event()
                .setOriginal(e)
                .setStopDown()
                .setStopUp()
                .setResult();
            switch (identifier) {
                case 'paste':
                    setControlTypeApply(input);
                    break;
                case 'reset':
                    setControlTypeReset(input);
                    break;
                case 'remember':
                    setControlTypeRemember(input);
                    break;
                case 'forget':
                    setControlTypeForget(input);
                    break;
                case 'restore':
                    setControlTypeRestore(input);
                    break;
                default:
                    break;
            }
        });
        var menu = {};
        var leave = false;
        var manager = new MS.Relations();
        MS.Events().addMouseLeave(menu, function () {
            if (leave === true) {
                leave = false;
                MS.Events().produceClick(trigger);
            }
        });
        var relation = new MS.Relation()
            .setActivator(trigger)
            .addDependant(trigger);
        manager.addRelation(relation);
        MS.Events().addClick(trigger, function (event) {
            manager.setEvent(event);
            manager.setResult(function (selected) {
                if (selected === true) {
                    leave = true;
                }
            });
        });
    }

    //
    function setControlsTypeApply(control) {
        new MS.ForEach()
            .setCollection(collections)
            .setResult(function (index, collection) {
                new MS.ForEach()
                    .setCollection(collection.children)
                    .setResult(function (index, input) {
                        setControlTypeApply(input);
                    });
            });
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeRemember(control) {
        new MS.ForEach()
            .setCollection(collections)
            .setResult(function (index, collection) {
                new MS.ForEach()
                    .setCollection(collection.children)
                    .setResult(function (index, input) {
                        setControlTypeRemember(input);
                    });
            });
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeForget(control) {
        new MS.ForEach()
            .setCollection(collections)
            .setResult(function (index, collection) {
                new MS.ForEach()
                    .setCollection(collection.children)
                    .setResult(function (index, input) {
                        setControlTypeForget(input);
                    });
            });
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeReset(control) {
        new MS.ForEach()
            .setCollection(collections)
            .setResult(function (index, collection) {
                new MS.ForEach()
                    .setCollection(collection.children)
                    .setResult(function (index, input) {
                        setControlTypeReset(input);
                    });
            });
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeSubmit(control) {
        new MS.ForEach()
            .setCollection(collections)
            .setResult(function (index, collection) {
                setAudit(collection);
            });
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeDelete(control) {
        control.setAttribute('data-s', 0);
    }

    function setControlsTypeStore(control) {}

    function setControlsTypeRestore(control) {
        control.setAttribute('data-s', 0);
    }

    function setAudit(collection) {
        var info = collection.parentNode.parentNode.parentNode;
        var values = [];
        new MS.ForEach()
            .setCollection(collection.children)
            .setResult(function (index, input) {
                var selected = input.getAttribute('data-s');
                var sInput = selected === null ? input.children[0] : input.children[1];
                if (selected === '1' || selected === null) {
                    values.push({name: sInput.name, value: sInput.value});
                }
            });
        var data = JSON.stringify(values);
        var parts = window.service.auditUri.split('?');
        var path = parts[0].replace('audit', '');
        document.cookie = 'audit=' + data + '; expires=; path=' + path + ';';
        new MS.XmlHttpRequest()
            .setUrl(window.service.auditUri)
            .setResult(function (XmlHttpResponse) {
                if(XmlHttpResponse.getResult() === true){
                    if (XmlHttpResponse.getSuccess() !== null) {
                        new MS.ForEach()
                            .setCollection(info.children)
                            .setResult(function (index, requirement) {
                                if (index > 0) {
                                    var results = XmlHttpResponse.getSuccess();
                                    var r = requirement.getAttribute('data-r');
                                    var e =  results[r] === true ? 1 : 2;
                                    requirement.setAttribute('data-e', e);
                                }
                            });
                    } else if (XmlHttpResponse.getFailure() !== null) {

                    }
                } else {
                    console.log(XmlHttpResponse.getResult());
                    info.setAttribute('data-e', 2);
                }
                document.cookie = 'audit=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + ';';
            });
    }
    //
    function setControlTypeApply(input) {
        var selected = input.getAttribute('data-s');
        var sInput = selected === null ? input.children[0] : input.children[1];
        var name = sInput.name;
        if (localStorage.getItem(name)) {
            var value = localStorage.getItem(name);
            if (selected === null) {
                sInput.value = value;
            } else {
                MS.Events().produceClick(input);
            }
        }
    }

    function setControlTypeRemember(input) {
        var selected = input.getAttribute('data-s');
        var sInput = selected === null ? input.children[0] : input.children[1];
        if (selected === '1' || selected === null) {
            var name = sInput.name;
            var value = sInput.value;
            localStorage.setItem(name, value);
        }
    }

    function setControlTypeForget(input) {
        var selected = input.getAttribute('data-s');
        var sInput = selected === null ? input.children[0] : input.children[1];
        if (selected === '1' || selected === null) {
            var name = sInput.name;
            localStorage.removeItem(name);
        }
    }

    function setControlTypeReset(input) {
        var selected = input.getAttribute('data-s');
        var sInput = selected === null ? input.children[0] : input.children[1];
        if (selected === null) {
            sInput.value = '';
        } else if (selected === 1) {
            MS.Events().produceClick(input);
        }
    }

    function setControlTypeStore(input) {
        var selected = input.getAttribute('data-s');
        var sInput = selected === null ? input.children[0] : input.children[1];
        if (selected === '1' || selected === null) {
            var name = sInput.name;
            var value = sInput.value;
            localStorage.setItem(name, value);
        }
    }

    function setControlTypeRestore(input) {}

    function setEvents(collection) {
        var search = collection.previousElementSibling;
        if (search !== null) {
            MS.Events().addKeyUp(search, function (event) {
                new MS.LiveSearch()
                    .setElements(collection)
                    .setValueSelector('class', 'input')
                    .setPhrase(this.textContent)
                    .setResult();
            });
        }
        var edition = collection.parentNode;
        var editionTrigger = edition.previousElementSibling;
        var workspace = editionTrigger.parentNode;
        var info = workspace.previousElementSibling;
        var unit = info.parentNode;
        var type = editionTrigger.getAttribute('data-i');
        switch (type) {
            case 'select':
            case 'select-multistage':
                setSelectManager(type, unit, editionTrigger, info, collection, search);
                break;
            case 'text':
            case 'text-suggestion':
                setTextManager(type, unit, editionTrigger, info, collection);
                break;
            case 'file':
                setFileManager(type, unit, editionTrigger, info, collection);
                break;
            case 'date':
            case 'time':
            case 'timestamp':
                setDatetimeManager(type, unit, editionTrigger, info, collection);
                break;
        }
        //setMultiLine(workSpace, line);
        new MS.ForEach()
            .setCollection(collection)
            .setResult(function (index, input) {
                var menuTrigger = input.children[0];
                MS.Events().addClick(menuTrigger, function (e) {
                    setMenuManager(menuTrigger, input);
                });
            });
    }

    function setMultiLine(workSpace, line) {
        function setSubtractLine(workSpace, line) {
            workSpace.removeChild(line);
        }
        function setAddLine(workSpace, line) {
            var clone = line.cloneNode(true);
            var nextLine = line.nextElementSibling;
            if (nextLine === null) {
                workSpace.appendChild(clone);
            } else {
                workSpace.insertBefore(clone, nextLine);
            }
            new MS.Tracker()
                .setElements(clone)
                .setResult()
                .setAttribute('data-identifier', 'reset')
                .setResult(function (index, elements) {
                    MS.Events().produceClick(this);
                });
            setLineEvents(workSpace, clone);
        }
        function resetIdentifiers(lines) {
            var lineIndex;
            new MS.ForEach()
                .setCollection(lines)
                .setResult(function (index, line) {
                    lineIndex = index;
                    var workspace = line.children[2];
                    var units = workspace.children;
                    new MS.ForEach()
                        .setCollection(units)
                        .setResult(function (index, unit) {
                            var identifier = unit.getAttribute('data-identifier');
                            var parts = identifier.split('/');
                            var previousIndex = parts[2];
                            parts[2] = lineIndex;
                            var newIdentifier = parts.join('/');
                            unit.setAttribute('data-identifier', newIdentifier);
                            unit.children[0].setAttribute('data-identifier', newIdentifier);
                            unit.children[1].setAttribute('data-identifier', newIdentifier);
                            unit.children[1].children[1].setAttribute('data-identifier', newIdentifier);
                            unit.children[3].setAttribute('data-identifier', newIdentifier);
                            var elementsContainer = unit.children[3];
                            new MS.ForEach()
                                .setCollection(elementsContainer.getElementsByClassName('element'))
                                .setResult(function (index2, element) {
                                    var from = '[' + previousIndex + ']';
                                    var to = '[' + lineIndex + ']';
                                    var newElementIdentifier = element.getAttribute('data-identifier').replace(from, to);
                                    element.setAttribute('data-identifier', newElementIdentifier);
                                    element.children[0].setAttribute('data-identifier', newElementIdentifier);
                                    element.children[1].setAttribute('data-identifier', newElementIdentifier);
                                    element.children[1].children[1].setAttribute('data-name', newElementIdentifier);
                                    element.children[1].children[1].setAttribute('data-identifier', newElementIdentifier);
                                });
                        });
                });
        }

        var lineControls = line.children[1];
        var btnAdd = lineControls.children[0];
        var btnSubtract = lineControls.children[1];
        var maxQuantity = lineControls.getAttribute('data-quantity');
        if (workSpace.children.length === 1) {
            btnSubtract.setAttribute('data-active', 0);
        } else if (workSpace.children.length < parseInt(maxQuantity)) {
            new MS.Tracker()
                .setElements(workSpace.children)
                .setResult()
                .setAttribute('data-identifier', 'subtract-line')
                .setResult(function (index1, elements1) {
                    this.setAttribute('data-active', 1);
                });
        }
        MS.Events().addClick(btnAdd, function (event) {
            var addActive = btnAdd.getAttribute('data-active');
            if (addActive === '1') {
                if (workSpace.children.length < parseInt(maxQuantity)) {
                    btnSubtract.setAttribute('data-active', 1);
                    setAddLine(workSpace, line);
                    resetIdentifiers(workSpace.children);
                }
                if (workSpace.children.length === parseInt(maxQuantity)) {
                    new MS.Tracker()
                        .setElements(workSpace.children)
                        .setResult()
                        .setAttribute('data-identifier', 'add-line')
                        .setResult(function (index1, elements1) {
                            this.setAttribute('data-active', 0);
                        });
                }
            }
        });
        MS.Events().addClick(btnSubtract, function (e) {
            var subtractActive = btnSubtract.getAttribute('data-active');
            if (subtractActive === '1') {
                if (workSpace.children.length > 1) {
                    setSubtractLine(workSpace, line);
                } else {
                    btnSubtract.setAttribute('data-active', 1);
                }
                if (workSpace.children.length < parseInt(maxQuantity)) {
                    new MS.Tracker()
                        .setElements(workSpace.children)
                        .setResult()
                        .setAttribute('data-identifier', 'add-line')
                        .setResult(function (index1, elements1) {
                            this.setAttribute('data-active', 1);
                        });
                }
                if (workSpace.children.length === 1) {
                    new MS.Tracker()
                        .setElements(workSpace.children)
                        .setResult()
                        .setAttribute('data-identifier', 'subtract-line')
                        .setResult(function (index1, elements1) {
                            this.setAttribute('data-active', 0);
                        });
                }
            }
        });
    }
    self.setParent = function (value) {
        parent = value;
        return self;
    };
    self.setResult = function () {
        var form = parent.getElementsByTagName('form');
        if(form.length > 0){
            form = result = form[0];
            var lastIndex = form.children.length - 1;
            collections = form.children[lastIndex].getElementsByClassName('collection');
            new MS.ForEach()
                .setCollection(form.children)
                .setResult(function (index, control) {
                    if (form.children[lastIndex] !== control) {
                        var classN = control.getAttribute('class');
                        if (classN === 'su') {
                            MS.Events().addKeyUp(form, function (e) {
                                var key = new MS.Keyboard()
                                    .setEvent(e)
                                    .setResult();
                                if (key.isEnter() === true) {
                                    MS.Events().produceClick(control);
                                }
                            });
                        }
                        MS.Events().addClick(control, function (e) {
                            control.setAttribute('data-s', 1);
                            switch (classN) {
                                case 'aa':
                                    setControlsTypeApply(control);
                                    break;
                                case 're':
                                    setControlsTypeReset(control);
                                    break;
                                case 'ar':
                                    setControlsTypeRemember(control);
                                    break;
                                case 'af':
                                    setControlsTypeForget(control);
                                    break;
                                case 'su':
                                    setControlsTypeSubmit(control);
                                    break;
                                case 'de':
                                    setControlsTypeDelete(control);
                                    break;
                                case 're1':
                                    //what I have just reset
                                    setControlsTypeRestore(control);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                });
            new MS.ForEach()
                .setCollection(collections)
                .setResult(function (index, collection) {
                    setEvents(collection);
                });
            var millis = Date.now() - start;
            console.log("milliseconds = " + Math.floor(millis));
        }

        return self;
    };
    self.getResult = function(){
        return result;
    };
};