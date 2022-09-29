const User = require("../Models/UserModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const emailService = require("../utils/email");
const { createToken } = require("../utils/tokenService");
const { randomString } = require("../utils/generator");

exports.loginRender = async (req, res, next) => {
  res.render("login.ejs", { message: req.flash("message") });
};

exports.registerRender = async (req, res, next) => {
  res.render("register.ejs");
};

exports.mainRender = async (req, res, next) => {
  let user = await User.findOne({ where: { id: req.authenticatedUser.id } });

  res.render("main.ejs", { user: user });
};

/*
 *  This is a duplicate login function of the in usersAuth.js. The difference is, this one is used for client to be redirected to main page,
 *  and the other is for testing.
 */
exports.loginUser = async (req, res, next) => {
  let errors = [];
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) errors.push({ message: "Incorrect credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) errors.push({ message: "Incorrect credentials" });
    if (user.inactive) errors.push({ message: "Please activate your account" });

    if (errors.length > 0) {
      return res.render("login", { errors });
    } else {
      const token = await createToken(user);

      res.cookie("token", token);
      return res.redirect("/classes");
    }
  } catch (error) {
    errors.push({ message: "An error occured :(" });
    return res.render("login.ejs", { errors });
  }
};

/*
 *  This is also a duplicate register function of the in users.js. The difference is, this one is used for client to be redirected to login page,
 *  and the other is for testing.
 */
exports.createUser = async (req, res, next) => {
  let errors = [];
  try {
    const { firstname, lastname, email, password, role } = req.body;

    if (!firstname || !lastname || !password || !email)
      errors.push("Please fill all the fields");

    if (errors.length > 0) res.render("register", { errors });

    let hashedpassword = await bcrypt.hash(password, 10); // hash password
    let formattedMail = email.replace(/\s+/g, "").toLowerCase();

    let user = {
      // update password and generate mail token on request body
      firstname,
      lastname,
      email: formattedMail,
      password: hashedpassword,
      role,
      activationToken: randomString(16),
    };

    try {
      let createdUser = await User.create(user);
      await emailService.sendAccountActivation(email, user.activationToken);
      req.flash(
        "message",
        "Registration successful, an activation mail has been sent to your e-mail!"
      );
      return res.redirect("/users/login");
    } catch (error) {
      console.log(error);
      errors.push({ message: error.errors[0].message });
      return res.render("register", { errors });
    }
  } catch (error) {
    console.log(error);
    errors.push({ message: "An error occured :(" });
    return res.render("register", { errors });
  }
};

exports.logoutUser = async (req, res, next) => {
  res.cookie("token", " ", { maxAge: 1 });
  res.redirect("/users/login");
};
