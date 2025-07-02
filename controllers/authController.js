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
      await User.create({ username, password, email });
      ctx.redirect('/');
    } catch (err) {
      ctx.status = 400;
      await ctx.render('index', { error: 'Registration failed' });
    }
  },

  login: async (ctx) => {
    const { username, password } = ctx.request.body;
    const user = await User.findByUsername(username);
    
    if (user && user.password === password) {
      ctx.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      ctx.redirect(`/${username}`);
    } else {
      await ctx.render('index', { 
        error: 'Invalid credentials',
        session: ctx.session
      });
    }
  },

  logout: (ctx) => {
    ctx.session = null;
    ctx.redirect('/');
  }
};
