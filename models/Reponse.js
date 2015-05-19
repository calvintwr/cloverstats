'use strict';

// RESPONSE table is a non-critical table. Many of it's attribute has loose restrctions.

function Response(sequelize, DataTypes) {

    var Response = sequelize.define('Response', {
        responseId: {
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
        response: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        // future implementation of targeted advertisement
        // impressionKeywords are keywords extracted from the name of the impression.
        impressionKeyWords: {
            type: DataTypes.ARRAY,
            allowNull: false,
            defaultValue: []
        }
    }, {
        timestamps: true,
        updatedAt: false,
        tableName: 'Response',
        classMethods: {
            associate: function(models) {
                // USER 
                Response.belongsTo(models.User, { foreignKey: 'User_userId' });
            }
        }
    });
return Response;
};

module.exports = Response;
