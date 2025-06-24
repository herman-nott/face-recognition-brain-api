function handleSignin(req, res, db, bcrypt) {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).json('Incorrect form submission');
    }

    db.select('username', 'email', 'hash').from('login')
        .where(function () {
            this.where('email', '=', emailOrUsername)
                .orWhere('username', '=', emailOrUsername);
        })
        .then(async data => {
            try {
                const isValid = await bcrypt.compare(password, data[0].hash);

                if (isValid) {
                    return db.select('*').from('users')
                        .where(function () {
                            this.where('email', '=', emailOrUsername)
                                .orWhere('username', '=', emailOrUsername);
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                        .catch(err => res.status(400).json('Unable to get a user'));
                } else {
                    res.status(400).json('Wrong credentials');
                }
            } catch (error) {
                res.status(500).json('Server error');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
}

module.exports = {
    handleSignin
};