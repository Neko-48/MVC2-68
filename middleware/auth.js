export const isCitizen = (req, res, next) => {
	if (req.session && req.session.role && req.session.role !== 'official') return next();
	return res.redirect('/login');
};

export const requireLogin = (req, res, next) => {
	if (req.session && req.session.role) return next();
	return res.redirect('/login');
};
