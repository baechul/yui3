YUI.add("clickable-rail",function(B){function A(){this._initClickableRail();}B.ClickableRail=B.mix(A,{prototype:{_initClickableRail:function(){this._evtGuid=this._evtGuid||(B.guid()+"|");this.publish("railMouseDown",{defaultFn:this._defRailMouseDownFn});this.after("render",this._bindClickableRail);this.on("destroy",this._unbindClickableRail);},_bindClickableRail:function(){this._dd.addHandle(this.rail);this.rail.on(this._evtGuid+"mousedown",this._onRailMouseDown,this);},_unbindClickableRail:function(){if(this.get("rendered")){var C=this.get("contentBox"),D=C.one("."+this.getClassName("rail"));D.detach(this.evtGuid+"*");}},_onRailMouseDown:function(C){if(this.get("clickableRail")&&!this.get("disabled")){this.fire("railMouseDown",{ev:C});}},_defRailMouseDownFn:function(E){E=E.ev;var C=this._resolveThumb(E),D;if(C){if(!C.startXY){C._setStartPosition(C.getXY());}D=this._getThumbDestination(E,C.get("dragNode"));C._alignNode(D);C._handleMouseDownEvent(E);}},_resolveThumb:function(D){var E=this._dd.get("primaryButtonOnly"),C=!E||D.button<=1;return(C)?this._dd:null;},_getThumbDestination:function(F,E){var D=E.get("offsetWidth"),C=E.get("offsetHeight");return[(F.pageX-Math.round((D/2))),(F.pageY-Math.round((C/2)))];}},ATTRS:{clickableRail:{value:true,validator:B.Lang.isBoolean}}},true);},"@VERSION@",{requires:["slider-base"]});