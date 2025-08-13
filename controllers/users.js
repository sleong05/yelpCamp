const User = require('../models/user')

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);

            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/historicalsites')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('registm er')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/historicalsites';
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/historicalsites');
    });
}

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}