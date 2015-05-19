function TestSegment(sequelize, DataTypes) {

    var TestSegment = sequelize.define('TestSegment', {
        testSegmentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        // the number of impressions defined by tester.
        limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        // queriesLeft = limit at the start
        // the number of impressions left. Decremented after each result is entered.
        impressionsLeft: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        // queriesLeft is used to block over-fulfilling a test.
        //
        // queriesLeft = limit at the start
        // queriesLeft is decremented everytime a test is queried.
        //
        // When lastQuery is 10 minutes old, it is matched with the
        // number of dataMeta.results and impressionsLeft. 
        // If dataMeta.results < limit, update impressionsLeft and queryCounter.
        // "Release" the test for fresh users.
        //
        // When test is complete, the following condition must be enforced:
        // dataMeta.results.length == limit. impressionsLeft == queriesLeft == 0
        queriesLeft: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        // queriedBy is used insert an eligible candidate's userId at first query.
        // subsequently when user returns the response 'yeah/nah', the rows is simply
        // checked for existence of the userId, and not re-checking the rest of the criteria
        // This prevents malicious attempts to mass update and earn koupoints.
        arrayQueriedBy: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
            defaultValue: []
        },
        // lastQuery is the timestamp of the most recent 
        lastQuery: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dataMeta: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: false
        },
        // dataResults.results will contain an ARRAY with denormalized userIds and other info.
        // results are denormalized from Response table
        arrayResults: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            defaultValue: [],
            allowNull: false
        },
        // used to contain all statistical results
        dataStats: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: false
        },
        /* TestSegment criteria */
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'both',
            validate: {
                isIn: [['both', 'male', 'female']]
            }
        },
        // ageLowerBound and ageUpperBound is used together
        // to defined an age segment
        ageLowerBound: {
            type: DataTypes.INTEGER(2),
            allowNull: false,
            defaultValue: -1
        },
        ageUpperBound: {
            type: DataTypes.INTEGER(2),
            allowNull: false,
            defaultValue: -1
        },
        locationByCountry: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [false]
        }
    }, {
        timestamps: true,
        tableName: 'TestSegment',
        classMethods: {
            associate: function(models) {
                // TESTS
                TestSegment.belongsTo(models.Impression, {foreignKey: 'Impression_impressionId', onUpdate: 'CASCADE', onDelete: 'CASCADE'});
            }
        }
    });
return TestSegment;
};

module.exports = TestSegment;
