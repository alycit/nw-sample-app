angular.module('myApp', ['myApp.services', 'myApp.controllers'])
    .run(function(DB) {
        DB.init();
    });

angular.module('myApp.config', [])
    .constant('DB_CONFIG', {
        name: 'checkingRegister',
        tables: [{
            name: 'transactions',
            columns: [{
                name: 'id',
                type: 'INTEGER PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'payee',
                type: 'TEXT NOT NULL'
            }, {
                name: 'date',
                type: 'DATETIME NOT NULL'
            }, {
                name: 'amount',
                type: 'DOUBLE NOT NULL'
            }]
        }]
    });

angular.module('myApp.controllers', ['myApp.services'])
    .controller('RegisterCtrl', function(Transaction) {
        self = this;
        self.transactions = [];
        self.newTransaction = {};

        self.addTransaction = function() {
          self.transactions.push(self.newTransaction);
          Transaction.create(self.newTransaction.date, self.newTransaction.payee, self.newTransaction.amount);
          self.newTransaction = {};
        };

        Transaction.all().then(function(transactions) {
            self.transactions = transactions;
        });

    });

angular.module('myApp.services', ['myApp.config'])

.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function() {
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'db for bank register', 2 * 1024 * 1024);

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

.factory('Transaction', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM transactions')
            .then(function(result) {
                return DB.fetchAll(result);
            });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM transactions WHERE id = ?', [id])
            .then(function(result) {
                return DB.fetch(result);
            });
    };

    self.create = function(payee, date, amount) {
        return DB.query('INSERT INTO transactions VALUES (NULL, ?, ?, ?)', [payee, date, amount])
            .then(function(result) {
                console.log(result);
            });
    }

    return self;
});
