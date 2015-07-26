'use strict';

var debug = DEBUG('engine');

function Runner() {
    
    /* SET UP VARIABLES */
    var howFarBack = [ 3, "months" ];

    // how many responses in order to consider it. If you only want to consider
    // data which user had made more than 5 responses, put 5 here.
    var minimumResponseThreshold = 1; 

    /* END SET UP */

    var sql = '';

    // get a table of responses that is grouped by userId over the defined period (typically past 3 months)
    var tableOfResponsesGroupedByUsers  = '';
        tableOfResponsesGroupedByUsers += 'SELECT "User_userId", age, gender, location, SUM(CASE WHEN response=\'y\' THEN 1 ELSE 0 END) as yes, count(*) as total ';
        tableOfResponsesGroupedByUsers += 'FROM "Response" ';
        tableOfResponsesGroupedByUsers += 'WHERE "createdAt" > \'' + moment().subtract(howFarBack[0], howFarBack[1]).format() + '\' ';
        tableOfResponsesGroupedByUsers += 'GROUP BY "User_userId", age, gender, location ';

    // further filter out only those who have passed the minimumResponseThreshold.
    sql = 'SELECT "User_userId", age, gender, location, (yes *100.0 / total) AS percentage ';
    sql += 'FROM ( ';
        sql += tableOfResponsesGroupedByUsers;
    sql += ') AS "AggregatedByResponse" ';
    sql += 'WHERE total > ' + minimumResponseThreshold;

    debug('Starting the process...');
    return _getLatestBatchNumber().then(function(batchNumber) {
        debug('batchNumber obtained is', batchNumber);

        batchNumber = batchNumber + 1; // increment the batchNumber

        // grab the table
        debug('Grabbing the new table...');
        return DB.sequelize.query(sql, {type: DB.sequelize.QueryTypes.SELECT, raw: true}).then(function(results) {
            debug('Table grab done, starting sequence to convert data into rows to insert into PercentileTable.');

            return DB.sequelize.transaction({ isolationLevel: 'SERIALIZABLE'}, function() {
                var timestamp = MOMENT().format();

                //break the results up into smaller chunks of 10,000
                var chunk = 10000;

                var promises = [];

                // for each chunk, generate an update sql to insert the results of the previously obtained
                // aggregated table into the database so that it can be used.
                for(var i=0; i<results.length; i+=chunk) {
                    debug('Processing results chunk', i, 'to', i+chunk);

                    var sql = '';
                    sql += 'INSERT INTO "PercentileTable" ';
                    sql += '( age, gender, location, "batchNumber", "batchDate", "percentageResponse1", "User_userId" ) ';
                    sql += 'VALUES ';

                    // generate the tuples for each row
                    // var j=i: start from the beginning of the chunk
                    // j<i+chunk: do not loop through rows greater than end of the chunk
                    for(var j=i; j<i+chunk; j++) {

                        var row = results[j];
                        if (!row) break; // if the end of the chunk is reached, break out

                        if (j !== i ) sql += ', ';
                        
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
                    debug('Running chunked query.');
                    // run the chunked query
                    var chunkUpdate = DB.sequelize.query(sql, {type: DB.sequelize.QueryTypes.UPDATE, raw: true});
                    promises.push(chunkUpdate);
                }

                debug('All chunked query processed.');
                return PROMISE.all(promises);

            });

        });

    }).catch(function(err) {
        console.log(err.stack);
    });
}

function _getLatestBatchNumber() {
    debug('Getting latest batchNumber');
    return DB.sequelize.query('SELECT "batchNumber" FROM "PercentileTable" ORDER BY "batchNumber" DESC LIMIT 1', {type: DB.sequelize.QueryTypes.SELECT, raw: true}).then(function(result) {
        if (result.length === 0) return 0;
        else return result[0].batchNumber;
    });
}

module.exports = Runner;