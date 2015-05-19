'use strict';

var express = require('express');
var router = express.Router();

/* Temporary route */
router.get('/makeshop/:shopname', function(req, res) {

    DB.Shop.create({
        shopName: req.params.shopname,
        User_userId: req.user.userId,
        isFeatured: true
    }).then(function() {
        res.send('success');
    }).catch(function(err) {
        console.log(err.stack);
    });

});


/* END TEMP ROUTES */

/* GET home page. */
router.get('/', function(req, res) {
    if (!req.isAuthenticated()) return res.render('index', { title: 'Koupon' });

    res.render('feed', {
        pageName: 'feed',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: 'partials/header',
            bottomNav: 'partials/bottomNav' 
        }
    });

});

router.get('/privacy', function(req, res) {

    res.render('privacy', {
        pageName: 'privacy',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: 'partials/header',
            bottomNav: 'partials/bottomNav' 
        }
    });
});

router.get('/privacypolicy', function(req, res) {

    res.render('privacy', {
        pageName: 'privacy',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: 'partials/header',
            bottomNav: 'partials/bottomNav' 
        }
    });
});

router.get('/test', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('test', {
        pageName: 'Tests Summary',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: 'partials/header',
            bottomNav: 'partials/bottomNav' 
        }
    });
});

router.get('/test/add', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('test/add', {
        pageName: 'Add test',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: '../partials/header',
            bottomNav: '../partials/bottomNav' 
        }
    });
});

router.get('/manage_koupon/see_redeemed', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('redeemedKouponsAsIssuer', {
        pageName: 'Redeemed Koupons',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        shopId: req.query.shopId,
        partials: { 
            header: './partials/header',
            bottomNav: './partials/bottomNav' 
        }
    });
});

router.get('/manage_koupon/:shopid?', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    if (!req.params.shopid) {

        res.render('chooseShop', {
            pageName: 'Choose Shop To Manage',
            user: req.user,
            userStringified: JSON.stringify(req.user),
            partials: { 
                header: './partials/header',
                bottomNav: './partials/bottomNav' 
            }
        });

    } else {

        req.user.hasShop(req.params.shopid).then(function(hasShop) {
            if (!hasShop) return res.status(400).send('User cannot access given shop id.');

            res.render('manageKoupon', {
                pageName: 'Manage Koupon',
                user: req.user,
                userStringified: JSON.stringify(req.user),
                shopId: req.params.shopid,
                partials: { 
                    header: './partials/header',
                    bottomNav: './partials/bottomNav' 
                }
            });
        })

    }

});

router.get('/redeem', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('redeemKoupon', {
        pageName: 'Redeem Koupon',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: './partials/header',
            bottomNav: './partials/bottomNav' 
        }
    });
});


router.get('/redeem/:shopId', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('redeemKouponShop', {
        pageName: 'Redeem Koupon',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        shopId: req.params.shopId,
        partials: { 
            header: './partials/header',
            bottomNav: './partials/bottomNav' 
        }
    });
});

router.get('/redeemed', function(req, res) {
    if (!req.isAuthenticated()) return res.redirect('/');

    res.render('redeemedKoupons', {
        pageName: 'Redeemed Koupons',
        user: req.user,
        userStringified: JSON.stringify(req.user),
        partials: { 
            header: './partials/header',
            bottomNav: './partials/bottomNav' 
        }
    });
});
module.exports = router;
