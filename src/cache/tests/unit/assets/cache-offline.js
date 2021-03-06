YUI.add('cache-offline-tests', function(Y) {
        // Set up the page
        var ASSERT = Y.Assert,
            ARRAYASSERT = Y.ArrayAssert,
            tearDown = function() {
                this.cache.flush();
            };
        

        var testClass = new Y.Test.Case({
            name: "Class Tests",
            
            tearDown : tearDown,

            testDefaults: function() {
                this.cache = new Y.CacheOffline();
                ASSERT.isInstanceOf(Y.Cache, this.cache, "Expected instance of Y.Cache.");
                ASSERT.areSame(null, this.cache.get("max"), "Expected default max of null.");
                ARRAYASSERT.isEmpty(this.cache.get("entries"), "Expected empty array.");
            },

            testDestructor: function() {
                this.cache = new Y.CacheOffline();
                this.cache.destroy();
                ARRAYASSERT.isEmpty(this.cache.get("entries"), "Expected empty array.");
            }
        });
        
        var testBasic = new Y.Test.Case({
            name: "Basic Tests",
            
            tearDown : tearDown,

            testMaxDefault: function() {
                this.cache = new Y.CacheOffline();
                ASSERT.areSame(null, this.cache.get("max"), "Expected max to be null.");
                
                this.cache.add(1, "a");
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entries.");
                ASSERT.isNotNull(this.cache.retrieve(1), "Expected null cached response.");
            },

            testMaxConfig: function() {
                this.cache = new Y.CacheOffline({max:2});
                ASSERT.isNull(null, this.cache.get("max"), "Expected max to be null.");
                
                this.cache.add(2, "b");
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entry.");
            },
        
            testMaxSet: function() {
                this.cache = new Y.CacheOffline();
                this.cache.set("max", 1);
                ASSERT.isNull(null, this.cache.get("max"), "Expected max to be null.");

                this.cache.add(3, "c");
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entry.");
            },

            testMaxSetNull: function() {
                this.cache = new Y.CacheOffline();
                this.cache.set("max", null);
                ASSERT.isNull(null, this.cache.get("max"), "Expected max to be null.");

                this.cache.add(4, "d");
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entry.");
            },

            testMaxSetNegative: function() {
                this.cache = new Y.CacheOffline({max:-2});
                ASSERT.isNull(null, this.cache.get("max"), "Expected max to be null.");

                this.cache.add(4, "d");
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entry.");
            },

            testRetrieve: function() {
                this.cache = new Y.CacheOffline(),
                this.cache.add(1, "a");
                this.cache.add("b", "c");

                var cachedentry = this.cache.retrieve(1);
                ASSERT.areSame("a", cachedentry.response, "Expected first cached response.");
                ASSERT.isInstanceOf(Date, cachedentry.cached, "Expected first cached Date.");
                ASSERT.isInstanceOf(Date, cachedentry.expires, "Expected first expires Date.");

                cachedentry = this.cache.retrieve("b");
                ASSERT.areSame("c", cachedentry.response, "Expected second cached response.");
                ASSERT.isInstanceOf(Date, cachedentry.cached, "Expected second cached Date.");
                ASSERT.isInstanceOf(Date, cachedentry.expires, "Expected second expires Date.");
            },

            testNoExpires: function() {
                this.cache = new Y.CacheOffline({expires:0}),
                this.cache.add(1, "a");
                this.cache.add("b", "c");

                var cachedentry = this.cache.retrieve(1);
                ASSERT.areSame("a", cachedentry.response, "Expected cached response.");
                ASSERT.isInstanceOf(Date, cachedentry.cached, "Expected cached Date.");
                ASSERT.isNull(cachedentry.expires, "Expected null expires.");
            },

            testExpiresNumber: function() {
                this.cache = new Y.CacheOffline({expires:3000}),
                this.cache.add(1, "a");

                var cachedentry = this.cache.retrieve(1);
                ASSERT.areSame("a", cachedentry.response, "Expected cached response.");
                ASSERT.isInstanceOf(Date, cachedentry.expires, "Expected cached Date.");
                
                this.cache.set("expires", 1);
                this.cache.add(1, "a");

                this.wait(function(){
                    cachedentry = this.cache.retrieve(1);
                    ASSERT.isNull(cachedentry, "Expected expired data.");
                }, 50);
            },

            testExpiresDate: function() {
                this.cache = new Y.CacheOffline({expires:new Date(new Date().getTime() + 86400000)}),
                this.cache.add(1, "a");

                var cachedentry = this.cache.retrieve(1);
                ASSERT.areSame("a", cachedentry.response, "Expected cached response.");
                ASSERT.isInstanceOf(Date, cachedentry.expires, "Expected cached Date.");
                
                this.cache.flush();
                this.cache.set("expires", new Date(new Date().getTime() - 86400000));
                this.cache.add(1, "a");
                cachedentry = this.cache.retrieve(1);
                ASSERT.isNull(cachedentry, "Expected expired data.");
            },

            testNoMatch: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add("a", "b");
                var cachedentry = this.cache.retrieve("c");
                ASSERT.areSame(null, cachedentry, "Expected no match.");
            },

            testFlush: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(1, "a");
                this.cache.add(2, "b");
                this.cache.flush();
                ASSERT.areSame(0, this.cache.get("size"), "Expected empty this.cache.");
            },
            
            testFlushAll: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(1, "a");
                this.cache.add(2, "b");
                
                var cache = new Y.CacheOffline({sandbox:"another"});
                cache.add(1, "a");
                cache.add(2, "b");

                if(window.localStorage) {
                    ASSERT.areSame(4, localStorage.length, "Expected 4 items.");
                }

                Y.CacheOffline.flushAll();
                
                if(window.localStorage) {
                    ASSERT.areSame(0, localStorage.length, "Expected empty localStorage.");
                }
            }
        });
    
        var testEvents = new Y.Test.Case({
            name: "Event Tests",

            tearDown : tearDown,

            testAdd: function() {
                var mock = new Y.Mock();
                Y.Mock.expect(mock, {
                    method: "handleAdd",
                    args: [Y.Mock.Value(function(e){
                        ASSERT.areSame(1, e.entry.request);
                        ASSERT.areSame("a", e.entry.response);
                    })]
                });

                this.cache = new Y.CacheOffline();
                this.cache.on("add", mock.handleAdd);
                this.cache.add(1, "a");

                Y.Mock.verify(mock);
            },
        
            testFlush: function() {
                var mock = new Y.Mock();
                Y.Mock.expect(mock, {
                    method: "handleFlush",
                    args: [Y.Mock.Value.Object]
                });

                this.cache = new Y.CacheOffline();
                this.cache.on("flush", mock.handleFlush);
                this.cache.add(1, "a");
                this.cache.flush();
                
                Y.Mock.verify(mock);
            },

            testRequest: function() {
                var mock = new Y.Mock();
                Y.Mock.expect(mock, {
                    method: "handleRequest",
                    args: [Y.Mock.Value(function(e){
                        ASSERT.areSame(2, e.request);
                    })]
                });

                this.cache = new Y.CacheOffline();
                this.cache.on("request", mock.handleRequest);
                this.cache.add(1, "a");
                this.cache.retrieve(2);
                
                Y.Mock.verify(mock);
            },

            testRetrieveSuccess: function() {
                var mock = new Y.Mock();
                Y.Mock.expect(mock, {
                    method: "handleRetrieve",
                    args: [Y.Mock.Value(function(e){
                        ASSERT.areSame(1, e.entry.request);
                        ASSERT.areSame("a", e.entry.response);
                    })]
                });

                this.cache = new Y.CacheOffline();
                this.cache.on("retrieve", mock.handleRetrieve);
                this.cache.add(1, "a");
                this.cache.retrieve(1);
                
                Y.Mock.verify(mock);
            },

            testRetrieveFailure: function() {
                var mock = new Y.Mock();
                Y.Mock.expect(mock, {
                    method: "handleRetrieve",
                    args: [Y.Mock.Value.Any],
                    callCount: 0
                });

                this.cache = new Y.CacheOffline();
                this.cache.on("retrieve", mock.handleRetrieve);
                this.cache.add(1, "a");
                this.cache.retrieve(2);
                
                Y.Mock.verify(mock);
            },

            testCancelAdd: function() {
                this.cache = new Y.CacheOffline();
                this.cache.on("add", function(e) {
                    e.preventDefault();
                }, this, true);
                this.cache.add(1, "a");
                
                // Test the cancel
                ASSERT.areSame(0, this.cache.get("size"), "Expected 0 entries.");
            },

            testCancelFlush: function() {
                this.cache = new Y.CacheOffline();
                this.cache.on("flush", function(e) {
                    e.preventDefault();
                }, this, true);
                this.cache.add(1, "a");
                this.cache.flush();
                
                // Test the cancel
                ASSERT.areSame(1, this.cache.get("size"), "Expected 1 entry.");
            }
        });

        var testEntryManagement = new Y.Test.Case({
            name: "Entry Management Tests",

            tearDown : tearDown,

            testNonUniqueKeys: function() {
                this.cache = new Y.CacheOffline({uniqueKeys:false}); // not supported
                this.cache.add(1, "a");
                this.cache.add(2, "b");
                this.cache.add(1, "c");
                ASSERT.areSame(2, this.cache.get("size"), "Expected 2 entries.");
            },

            testUniqueKeys: function() {
                this.cache = new Y.CacheOffline({uniqueKeys:true});
                this.cache.add(1, "a");
                this.cache.add(2, "b");
                this.cache.add(1, "c");
                ASSERT.areSame(2, this.cache.get("size"), "Expected 2 entries.");
            }/*,

            NOT SUPPORTED IN CACHEOFFLINE
            testFreshness: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(1, "a");
                this.cache.add(2, "b");
                this.cache.add(3, "c");
                this.cache.retrieve(1);
                ASSERT.areSame(3, this.cache.get("size"), "Expected 3 entries.");
                ASSERT.areSame(1, this.cache.get("entries")[2].request, "Expected entry to be refreshed.");
            }*/
        });

        var testBoundaryValues = new Y.Test.Case({
            name: "Invalid Value Tests",

            tearDown : tearDown,

            testUndefinedRequest: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(undefined, "a");
                this.cache.add(undefined, "b");
                ASSERT.areSame("b", this.cache.retrieve().response, "Expected cached response.");
            },

            testNullRequest: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(null, "a");
                this.cache.add(null, "b");
                ASSERT.areSame("b", this.cache.retrieve(null).response, "Expected cached response.");
            },

            testNaNRequest: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add(NaN, "a");
                this.cache.add(NaN, "b");
                ASSERT.areSame(0, this.cache.get("size"), "Expected 0 entries.");
            },

            testEmptyStringRequest: function() {
                this.cache = new Y.CacheOffline();
                this.cache.add("", "a");
                this.cache.add("", "b");
                ASSERT.areSame("b", this.cache.retrieve("").response, "Expected cached response.");
            }
        });

        var suite = new Y.Test.Suite("Cache Offline");
        suite.add(testClass);
        suite.add(testBasic);
        suite.add(testEvents);
        suite.add(testEntryManagement);
        suite.add(testBoundaryValues);

        Y.Test.Runner.setName("CacheOffline Test Runner");
        Y.Test.Runner.add(suite);
});
