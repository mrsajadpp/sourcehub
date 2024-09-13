const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

module.exports = {
    verifyAdmin: async (req, res, next) => {
        if (!req.session) return res.status(401).json({ error: 'Access denied' });
        try {
            if (!req.session.logged) return res.status(401).json({ error: 'Access denied' });
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid request' });
        }
    }
};