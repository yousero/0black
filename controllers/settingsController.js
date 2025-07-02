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
        await User.updateEmail(userId, email);
        ctx.session.user.email = email;
      }
      
      if (password) {
        await User.updatePassword(userId, password);
      }
      
      ctx.redirect('/settings');
    } catch (err) {
      await ctx.render('settings', { 
        user: ctx.session.user, 
        error: 'Failed to update settings',
        session: ctx.session
      });
    }
  }
};
