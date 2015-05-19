'use strict';

var debug = DEBUG('engine');

function Runner() {
    
    /* VARIABLES */
    var howFarBack = [ 3, "months" ];

    // how many responses in order to consider it. If you only want to consider
    // data which user had made more than 5 responses, put 5 here.
    var minimumResponseThreshold = 1; 



    var sql = '';
    sql = 'SELECT "User_userId", age, gender, location, (yes *100.0 / total) AS percentage ';
    sql += 'FROM ( ';
        sql += 'SELECT "User_userId", age, gender, location, SUM(CASE WHEN response=\'y\' THEN 1 ELSE 0 END) as yes, count(*) as total ';
        sql += 'FROM "Response" ';
        sql += 'WHERE "createdAt" > \'' + moment().subtract(howFarBack[0], howFarBack[1]).format() + '\' ';
        sql += 'GROUP BY "User_userId", age, gender, location ';
    sql += ') AS "AggregatedByResponse" ';
    sql += 'WHERE total > ' + minimumResponseThreshold;

    return _getLatestBatchNumber().then(function(batchNumber) {

        batchNumber = batchNumber + 1; // increment the batchNumber

        return DB.sequelize.query(sql, {type: DB.sequelize.QueryTypes.SELECT}, {raw: true}).then(function(results) {

            return DB.sequelize.transaction({ isolationLevel: 'SERIALIZABLE'}, function() {
                var timestamp = MOMENT().format();

                //break the results up into smaller chunks of 10,000
                var chunk = 2;

                var promises = [];

                for(var i=0; i<results.length; i+=chunk) {

                    var sql = '';
                    sql += 'INSERT INTO "PercentileTable" ';
                    sql += '( age, gender, location, "batchNumber", "batchDate", "percentageResponse1", "User_userId" ) ';
                    sql += 'VALUES ';

                    // generate the tuples
                    for(var j=i; j<i+chunk; j++) {
                        if (j !== i ) sql += ', ';
                        var row = results[j];

                        var fieldsToInsert = [
                            "'" + row.age + "'",
                            "'" + row.gender + "'",
                            "'" + row.location + "'",
                            batchNumber,
                            "'" + timestamp + "'",
                            row.percentage,
                            row.User_userId
                        ];

                        sql += '( ';
                        sql += fieldsToInsert.join(',');
                        sql += ') ';
                    }

                    var chunkUpdate = DB.sequelize.query(sql, {type: DB.sequelize.QueryTypes.UPDATE}, {raw: true});
                    promises.push(chunkUpdate);
                }

                return PROMISE.all(promises);

            });

        });

    }).catch(function(err) {
        console.log(err.stack);
    });
}

function _getLatestBatchNumber() {
    return DB.sequelize.query('SELECT "batchNumber" FROM "PercentileTable" ORDER BY "batchNumber" DESC LIMIT 1', {type: DB.sequelize.QueryTypes.SELECT}, {raw: true}).then(function(result) {
        if (result.length === 0) return 0;
        else return result[0].batchNumber;
    });
}

module.exports = Runner;