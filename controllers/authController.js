const User = require('../models/User');

module.exports = {
  showHome: async (ctx) => {
    await ctx.render('index', { 
      session: ctx.session
    });
  },

  register: async (ctx) => {
    try {
      const { username, password, email } = ctx.request.body;
      if (!username || !password || !email || username.length < 3 || password.length < 6 || !email.includes('@')) {
        ctx.status = 400;
        return await ctx.render('index', { error: 'Invalid registration data', session: ctx.session });
      }
      await User.create({ username, password, email });
      ctx.redirect('/');
    } catch (err) {
      ctx.status = 400;
      await ctx.render('index', { error: 'Registration failed', session: ctx.session });
    }
  },

  login: async (ctx) => {
    const { username, password } = ctx.request.body;
    if (!username || !password) {
      return await ctx.render('index', { error: 'Username and password required', session: ctx.session });
    }
    const user = await User.findByUsername(username);
    if (user && await User.verifyPassword(password, user.password)) {
      ctx.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      ctx.redirect(`/${username}`);
    } else {
      await ctx.render('index', { error: 'Invalid credentials', session: ctx.session });
    }
  },

  logout: (ctx) => {
    ctx.session = null;
    ctx.redirect('/');
  }
};
