function Shop(sequelize, DataTypes) {

    var Shop = sequelize.define('Shop', {
        shopId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        shopName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shopURL: {
            type: DataTypes.STRING,
            allowNull: true
        },
        currency: {
            type: DataTypes.CHAR(3),
            allowNull: false,
            validate: {
                isIn: [['SGD']] // currency.
            },
            defaultValue: 'SGD'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        rank: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: (function() { return Math.random() / 10000 })
        },
        dataMeta: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        dataKoupons: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'Shop',
        classMethods: {
            associate: function(models) {
                // USER
                Shop.belongsTo(models.User, {foreignKey: 'User_userId'});

                // KOUPON
                Shop.hasMany(models.Koupon, {
                    as: {
                        singular: 'IssuedKoupon',
                        plural: 'IssuedKoupons'
                    },
                    foreignKey: 'Shop_shopId__issuer'
                });

                // ADD SEARCH
                //this.addFullTextIndex();

            },
            vectorName: 'shopSearchVector',
            searchFields: ["shopName"],
            addFullTextIndex: function() {
                var self = this;
                var searchFields = this.searchFields;
                var vectorName = this.vectorName;

                return sequelize
                    .query('ALTER TABLE "' + self.tableName + '" ADD COLUMN "' + vectorName + '" TSVECTOR')
                    .then(function() {
                        return sequelize
                            .query('UPDATE "' + self.tableName + '" SET "' + vectorName + '" = to_tsvector(\'english\', ' + '"' + searchFields.join(' || \' \' || ') + '")');
                    }).then(function() {
                        return sequelize
                            .query('CREATE INDEX ' + self.vectorName + '_search_idx ON "' + self.tableName + '" USING gin("' + vectorName + '");');
                    }).then(function() {
                        return sequelize
                            .query('CREATE TRIGGER ' + self.vectorName + '_vector_update BEFORE INSERT OR UPDATE ON "' + self.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + '"' + searchFields.join(', ') + '")');
                    }).catch(function(err) {
                        console.log(err.stack)
                    });


            },
            search: function(query, opts) {

                // defaults and options handling
                var defaults = {
                    where: {
                        isActive: true
                    },
                    attributes: [
                        'shopId',
                        'shopName',
                        'currency',
                        'shopURL',
                        'dataKoupons',
                        'dataMeta',
                        'User_userId'
                    ],
                    limit: 11,
                    offset: 0
                };
                _.extend(defaults, opts);


                var queryLike = query + '%';

                //escaping.
                queryLike = sequelize.getQueryInterface().escape(queryLike);
                query = sequelize.getQueryInterface().escape(query);


                var attrs = JSON.stringify(defaults.attributes);
                attrs = attrs.substring(1, attrs.length-1);

                var sql  = 'SELECT ' + attrs + ' ';
                    sql += 'FROM "' + this.tableName + '" ';
                    sql += 'WHERE '
                        sql += '("' + this.vectorName + '" @@ plainto_tsquery(\'english\', ' + query + ') ';

                        // add OR + LIKE on fields.
                        for(var i=0; i<this.searchFields.length; i++) {
                            sql += 'OR "' + this.searchFields[i] + '" LIKE ' + queryLike + ') ';
                        }

                    // WHERE CRITERIA
                    var keys = Object.keys(defaults.where);
                    if (keys.length > 0) {  
                        for(var i in keys) {
                            var key = keys[i];
                            var value = defaults.where[key];

                            if ([null,false,true].indexOf(value) > -1) {
                                sql += ' AND "' + key + '" IS ' + value + ' ';
                            } else {
                                sql += ' AND ';
                                sql += ' "' + key + '" = ' + sequelize.getQueryInterface().escape(value) + ' ';
                            }
                            
                        }
                    }

                    // LIMIT
                    sql += 'LIMIT ' + defaults.limit + ' ';

                    // OFFSET
                    if (defaults.offset > 0) {
                        sql += 'OFFSET ' + defaults.offset + ' ';
                    }

                return sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
            }
        }
    });
return Shop;
};

module.exports = Shop;
