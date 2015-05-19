function Impression(sequelize, DataTypes) {

    var Impression = sequelize.define('Impression', {
        impressionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [0, 60] //name 
            }
        },
        imageArray: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        doneArray: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
            defaultValue: []
        },
        // status indicates whether a test is running or stopped
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        dataMeta: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: false
        },
        //dataResults.results will contain results from different test segments.
        dataResults: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: false
        },
        // used to contain all statistical results
        dataStats: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: false
        }

    }, {
        timestamps: true,
        tableName: 'Impression',
        getterMethods: {
            summaryStats: function() {
                if (this[DB.TestSegment.name + 's']) {
                    var totalLimit = 0;
                    var remaining = 0;
                    var totalYes = 0;
                    var segments = this[DB.TestSegment.name + 's'];
                    for(var i=0; i<segments.length; i++) {
                        var segment = segments[i];
                        totalLimit += segment.limit;
                        remaining += Math.max(segment.impressionsLeft, 0); // Math.max is used to preclude instance when impressionsLeft fall below 0

                        //yes/no
                        for(var j=0; j<segment.arrayResults.length; j++) {
                            if (segment.arrayResults[i].response === 'y') totalYes += 1;
                        }
                    }
                    var done = (remaining === 0) ? true: false;

                    var absolute = (totalLimit - remaining) + "/" + totalLimit;

                    var percent = (totalLimit - remaining)/totalLimit * 1000;
                    var percent = parseFloat((Math.floor(percent) / 10).toFixed(1));

                    var numberOfYes = totalYes;
                    var numberOfNo = (totalLimit - remaining) - totalYes;

                    return { 
                        numberOfYes: numberOfYes,
                        numberOfNo: numberOfNo,
                        progress: { done: done, absolute: absolute, percent: percent },

                    };
                }
                return null;
            },
            quickStats: function() {
                if (this[DB.TestSegment.name] + 's') {

                }
                return null;
            }
        },
        classMethods: {
            associate: function(models) {
                // USER
                Impression.belongsTo(models.User, {foreignKey: 'User_userId'});

                // TEST
                Impression.hasMany(models.TestSegment, {foreignKey: 'Impression_impressionId', onUpdate: 'CASCADE', onDelete: 'CASCADE'});
            }
        }
    });
return Impression;
};

module.exports = Impression;
