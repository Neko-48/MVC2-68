export const isOfficial = (req, res, next) => {
	if (req.session && req.session.role === 'official') return next();
	return res.redirect('/login');
};

export const isCitizen = (req, res, next) => {
	// treat anyone not 'official' as citizen for this simple app
	if (req.session && req.session.role && req.session.role !== 'official') return next();
	return res.redirect('/login');
};

export const requireLogin = (req, res, next) => {
	if (req.session && req.session.role) return next();
	return res.redirect('/login');
};
