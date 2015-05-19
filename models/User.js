var countryList = require('../apps/countryList.js').withoutRegion();

function User(sequelize, DataTypes) {

    var User = sequelize.define('User', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        /* TODO: create index on facebookId */
        facebookId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len:[0,30]
            }
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true
        },
        birthdate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        about: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len:[0, 600] // UI limit should be 500. this is 100 for buffer in case difference in accounting.
            }
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gender: {
            type: DataTypes.STRING(6),
            allowNull: true,
            validate: {
                isIn: [['', 'male','female']]
            }
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isIn: [countryList]
            }
        },
        kouponCredits: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        merchantCredits: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        fbProfileIsVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        fbToken: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        isMerchant: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        dataMeta: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'User',
        getterMethods: {
            age: function() {
                if (this.birthdate) {
                    try {
                        var age = moment().diff(this.birthdate, 'years');
                        return age;
                    } catch(err) {
                        return -1;
                    }
                }
                return -1;
            }
        },
        classMethods: {
            associate: function(models) {
                // IMPRESSION (as the person who created the tests.)
                User.hasMany(models.Impression, { foreignKey: 'User_userId' });

                
                // SHOP
                // while we use a hasMany relationship now even though
                // it is just 1:1 now. This is to prepare for the future.
                User.hasMany(models.Shop, { singular: 'Shop', plural: 'Shops', foreignKey: 'User_userId' });

                // KOUPON
                User.hasMany(models.Koupon, {
                    as: {
                        singular: 'RedeemedKoupon',
                        plural: 'RedeemedKoupons',
                    },
                    foreignKey: 'User_userId__redeemer'
                });

                //CreditMovement
                User.hasMany(models.CreditMovement, {
                    singular: 'CreditMovement',
                    plural: 'CreditMovements',
                    foreignKey: 'User_userId'
                });

                // ERROR
                User.hasMany(models.Error, {foreignKey: 'User_userId'});
            }
        }
    });
return User;
};

module.exports = User;
