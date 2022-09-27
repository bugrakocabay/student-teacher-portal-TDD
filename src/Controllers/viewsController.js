exports.loginRender = async (req, res, next) => {
	res.render("login.ejs");
};

exports.registerRender = async (req, res, next) => {
	res.render("register.ejs");
};

exports.mainRender = async (req, res, next) => {
	res.render("main.ejs");
};
