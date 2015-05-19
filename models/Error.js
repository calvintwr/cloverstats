/*
Error table is used to store critical error information, especially that involving payments.
*/

function Error(sequelize, DataTypes) {

    var Error = sequelize.define('Error', {
        errorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        uuid: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dataMeta: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'Error',
        classMethods: {
            associate: function(models) {
                // USER
                // errors are usually generated by users. So would be good to associate them.
                Error.belongsTo(models.User, {foreignKey: 'User_userId'});
            }
        }
    });
return Error;
};

module.exports = Error;