angular.module('myApp', ['myApp.services', 'myApp.controllers'])
    .run(function(DB) {
        DB.init();
    });

angular.module('myApp.config', [])
    .constant('DB_CONFIG', {
        name: 'moneyBudgetDBa',
        tables: [{
            name: 'transactions',
            columns: [{
                name: 'id',
                type: 'INTEGER PRIMARY KEY AUTOINCREMENT'
            },  {
                name: 'date',
                type: 'date NOT NULL'
            }, {
                name: 'payee',
                type: 'TEXT NOT NULL'
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
        self.transaction = {};

        self.setTransaction = function(index){
            var currentTx = self.transactions[index];
            self.transaction.id = currentTx.id;
            self.transaction.date = new Date(currentTx.date);
            self.transaction.payee = currentTx.payee;
            self.transaction.amount = currentTx.amount;
        }

        self.createOrUpdateTransaction = function() {
          if(self.transaction.id) {
            var indexToUpdate = _.findIndex(self.transactions, {id: self.transaction.id});
            self.transactions[indexToUpdate] = self.transaction;
            Transaction.update({id: self.transaction.id, date: Date.parse(self.transaction.date), payee: self.transaction.payee, amount: self.transaction.amount}, function() { self.transaction = {}; } );
          } else {
            self.transactions.push(self.transaction);
            Transaction.create(Date.parse(self.transaction.date), self.transaction.payee, self.transaction.amount, function() { self.transaction = {}; } );
          }
        };

        self.deleteTransaction = function(index) {
            Transaction.delete(self.transactions[index].id, function(){self.transactions.splice(index, 1) });
        }

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
        return DB.query('SELECT * FROM transactions order by date asc')
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

    self.create = function(date, payee, amount, callback) {
        return DB.query('INSERT INTO transactions (id, date, payee, amount) VALUES (NULL, ?, ?, ?)', [date, payee, amount])
            .then(callback);
    }

    self.update = function(transaction, callback) {
        return DB.query("UPDATE transactions set date = ?, payee = ?, amount = ? WHERE id = ?", [transaction.date, transaction.payee, transaction.amount, transaction.id])
            .then(callback);
    }
    self.delete = function(id, callback) {
        return DB.query('DELETE FROM transactions WHERE id=?', [id])
            .then(callback);
    }

    return self;
});
