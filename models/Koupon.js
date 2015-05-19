'use strict';

function Koupon(sequelize, DataTypes) {

    var Koupon = sequelize.define('Koupon', {
        kouponId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        kouponValue: {
            type: DataTypes.INTEGER(2),
            allowNull: false,
            validate: {
                isIn: [[5, 10, 15, 20]] // only allow koupon of these values. 
            }
        },
        kouponCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [5, 50] // code must be between 5-50. prevent hoax.
            }
        },
        // flag to indicate whether the koupon as been redeemed.
        // mainly for consideration of table lookup optimization.
        isRedeemed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        dateRedeemed: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dataMeta: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
            
        }
    }, {
        timestamps: true,
        tableName: 'Koupon',
        classMethods: {
            associate: function(models) {
                // SHOP Issuer
                Koupon.belongsTo(models.Shop, { as: 'Issuer', foreignKey: 'Shop_shopId__issuer' });

                // USER Redeemer
                Koupon.belongsTo(models.User, {
                    as: 'Redeemer', foreignKey: 'User_userId__redeemer'
                });
            }
        }
    });
return Koupon;
};

module.exports = Koupon;
