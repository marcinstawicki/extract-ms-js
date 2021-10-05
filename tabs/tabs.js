var MS = MS || {};
MS.Tabs = function(){
    var self = this;
    var parent;
    self.setParent = function(value){
        parent = value;
        return self;
    };
    self.setResult = function(callback){
        if(typeof callback !== 'function'){
            callback = function(){};
        }
        var tabsSection = parent.getElementsByClassName('hrt');
        new MS.ForEach()
            .setCollection(tabsSection)
            .setResult(function (index, element) {
                var manager = new MS.Relations().setStrict();
                var activators = element.children[0].getElementsByClassName('trigger');
                var dependants = element.children[1].children;
                new MS.ForEach()
                    .setCollection(activators)
                    .setResult(function (index, activator) {
                        var dependant = dependants[index];
                        var relation = new MS.Relation()
                            .setActivator(activator)
                            .addDependant(dependant);
                        manager.addRelation(relation);
                        MS.Events().addClick(activator, function(e){
                            if(activator instanceof HTMLAnchorElement){
                                new MS.Event()
                                    .setOriginal(e)
                                    .setStopDown()
                                    .setStopUp()
                                    .setResult();
                            }
                            manager.setEvent(e);
                            manager.setResult(function(selected){
                                if(selected === true){
                                    callback.call(this,dependant);
                                    if(activator instanceof HTMLAnchorElement && dependant.innerHTML === ''){
                                        var uri = activator.getAttribute('href');
                                        new MS.XmlHttpRequest()
                                            .setUrl(uri)
                                            .setResult(function(XmlHttpResponse){
                                                if(XmlHttpResponse.getResult() === true){
                                                    if (XmlHttpResponse.getSuccess() !== null) {
                                                        dependant.innerHTML = XmlHttpResponse.getSuccess();
                                                        var scripts = dependant.getElementsByTagName('script');
                                                        new MS.ForEach()
                                                            .setCollection(scripts)
                                                            .setResult(function (index1, script){
                                                                eval(script.text);
                                                            });
                                                    } else if (XmlHttpResponse.getFailure() !== null) {

                                                    }
                                                } else {
                                                    console.log(XmlHttpResponse.getResult());
                                                }
                                            });
                                    }
                                }
                            });
                        });
                    });
            });
        return self;
    };
};
MS.ParallelTabs = function(){
    var self = this;
    var tabSections = [];
    self.addTabSection = function(value){
        tabSections.push(value);
        return self;
    };
    self.setResult = function(){
        new MS.ForEach()
            .setCollection(tabSections)
            .setResult(function (index, tabSection) {
                var activators = tabSection.children[0].getElementsByTagName('button');
                new MS.ForEach()
                    .setCollection(activators)
                    .setResult(function (index1, activator) {
                        new MS.Events().addClick(activator, function(e){
                            new MS.ForEach()
                                .setCollection(tabSections)
                                .setResult(function (index2, tabSection2) {
                                    var activators2 = tabSection2.children[0].getElementsByTagName('button');
                                    if(tabSection !== tabSection2){
                                        MS.Events().produceClick(activators2[index1]);
                                    }
                                });
                        });
                    });
            });
        return self;
    };
};
