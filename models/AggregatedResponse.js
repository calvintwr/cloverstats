'use strict';

function AggregatedResponse(sequelize, DataTypes) {

    var AggregatedResponse = sequelize.define('AggregatedResponse', {
        arId: {
            type: DataTypes.BIGINT(19),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        age: {
            type: DataTypes.INTEGER(3),
            allowNull: true
        },
        gender: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        //reponse1 is "yes i will buy". there is no response2 required because it's 1-response1.
        percentageResponse1: {
            type: DataTypes.DECIMAL(3,2),
            allowNUll: false
        }
    }, {
        timestamps: true,
        tableName: 'AggregatedResponse',
        classMethods: {
            associate: function(models) {
                // USER 
                AggregatedResponse.belongsTo(models.User, { foreignKey: 'User_userId' });
            }
        }
    });
return AggregatedResponse;
};

module.exports = AggregatedResponse;
