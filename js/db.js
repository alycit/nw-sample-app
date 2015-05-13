var db = openDatabase('alyssa_funky_db', '1.0', 'my first database', 2 * 1024 * 1024);

db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');

  tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
    if(results.rows.length === 0) {
      tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "synergies")');
      tx.executeSql('INSERT INTO foo (id, text) VALUES (2, "luyao")');
      tx.executeSql('INSERT INTO foo (id, text) VALUES (3, "somehitng")');
      tx.executeSql('INSERT INTO foo (id, text) VALUES (4, "woooo")');
    } else {
      document.write("<p>The DB already exists!</p>")
    }
  });

});

db.transaction(function (tx) {
  tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
    var len = results.rows.length, i;
    document.write("<ul>");

    for (i = 0; i < len; i++) {
      document.write("<li>" + results.rows.item(i).text + "</li>");
    }

    document.write("</ul>");
  });
});
