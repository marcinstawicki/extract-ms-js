var MS = MS || {};
MS.Accordions = function(){
    var self = this;
    var parent;
    self.setParent = function(value){
        parent = value;
        return self;
    };
    self.setResult = function(){
        var accordionSections = parent.getElementsByClassName('hra');
        new MS.ForEach()
            .setCollection(accordionSections)
            .setResult(function (index, element) {
                var manager = new MS.Relations();
                var accordions = element.children;
                new MS.ForEach()
                    .setCollection(accordions)
                    .setResult(function (index, accordion) {
                        var activator = accordion.children[0].children[0];
                        var dependant = accordion.children[1];
                        var relation = new MS.Relation()
                            .setActivator(activator)
                            .addDependant(dependant);
                        manager.addRelation(relation);
                        MS.Events().addClick(activator, function(event){
                            manager.setEvent(event);
                            manager.setResult(function(selected){
                                if(selected === true){
                                    accordion.classList.add('r');
                                    new MS.ForEach()
                                        .setCollection(accordions)
                                        .setResult(function (index1, nAccordion) {
                                            if(index !== index1){
                                                nAccordion.classList.remove('r');
                                            }
                                        });
                                }
                            });
                        });
                    });
            });
        return self;
    };
};
