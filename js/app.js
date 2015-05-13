angular.module('myApp', ['myApp.services', 'myApp.controllers'])
    .run(function(DB) {
        DB.init();
    });

angular.module('myApp.config', [])
    .constant('DB_CONFIG', {
        name: 'alyssa_funky_db',
        tables: [{
            name: 'foo',
            columns: [{
                name: 'id',
                type: 'integer primary key autoincrement'
            }, {
                name: 'text'
            }]
        }]
    });

angular.module('myApp.controllers', ['myApp.services'])
    .controller('ItemCtrl', function($scope, Foo) {
        $scope.items = [];
        $scope.item = null;

        Foo.all().then(function(items) {
            $scope.items = items;
        });

    });

angular.module('myApp.services', ['myApp.config'])

.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function() {
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'my first database', 2 * 1024 * 1024);

        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];

            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');
        });
    };

    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };

    self.fetchAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }

        return output;
    };

    self.fetch = function(result) {
        return result.rows.item(0);
    };

    return self;
})

.factory('Foo', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM foo')
            .then(function(result) {
                return DB.fetchAll(result);
            });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM foo WHERE id = ?', [id])
            .then(function(result) {
                return DB.fetch(result);
            });
    };

    self.create = function(id, text) {
        return DB.query('INSERT INTO foo VALUES (NULL, ?, ?)', [id, text])
            .then(function(result) {
                console.log(result);
            });
    }

    return self;
});
