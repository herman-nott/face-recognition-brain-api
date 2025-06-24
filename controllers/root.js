async function handleRoot(req, res, db) {
    try {
        const users = await db.select('*').from('users');
        res.json(users);
    } catch (err) {
        res.status(500).json('Server error');
    }
}

module.exports = {
    handleRoot
};