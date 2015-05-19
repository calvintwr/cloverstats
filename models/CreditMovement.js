/*
CreditMovement table tracks the payment/refund of credits.
*/

function CreditMovement(sequelize, DataTypes) {

    var CreditMovement = sequelize.define('CreditMovement', {
        creditMovementId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                /*
                    paid: merchant made a payment resulting in increased credits.
                    refund: merchant was given a refund resulting in decrease credits.
                    test: merchant used up credits for tests, resulting in decrease in credits.
                    redemption: merchant's koupons was redeemed, resulting in increase in credits.
                */
                isIn: [['paid', 'refund', 'addtest', 'redemption']]
            }
        },
        paypalId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dataMeta: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'CreditMovement',
        classMethods: {
            associate: function(models) {
                // USER
                CreditMovement.belongsTo(models.User, {foreignKey: 'User_userId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
            }
        }
    });
return CreditMovement;
};

module.exports = CreditMovement;
