async function handleRegister(req, res, db, bcrypt) {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json('Incorrect form submission');
    }

    const hash = await bcrypt.hash(password, 10);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email,
            username: username
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    username: username,
                    email: loginEmail[0].email,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]);
                });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
    handleRegister
};