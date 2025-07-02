const User = require('../models/User');

module.exports = {
  showSettings: async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      return ctx.redirect('/');
    }
    
    const user = await User.findById(ctx.session.user.id);
    await ctx.render('settings', { 
      user,
      session: ctx.session
    });
  },

  updateSettings: async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      return ctx.redirect('/');
    }
    
    const userId = ctx.session.user.id;
    const { email, password } = ctx.request.body;
    
    try {
      if (email) {
        if (!email.includes('@')) {
          throw new Error('Invalid email format');
        }
        await User.updateEmail(userId, email);
        ctx.session.user.email = email;
      }
      
      if (password) {
        if (password.length < 6) {
          throw new Error('Password too short');
        }
        await User.updatePassword(userId, password);
      }
      
      ctx.redirect('/settings');
    } catch (err) {
      await ctx.render('settings', { 
        user: ctx.session.user, 
        error: err.message || 'Failed to update settings',
        session: ctx.session
      });
    }
  }
};
