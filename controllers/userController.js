const User = require('../models/User');
const Post = require('../models/Post');

module.exports = {
  profile: async (ctx) => {
    const username = ctx.params.username;
    const user = await User.findByUsername(username);
    
    if (!user) {
      ctx.status = 404;
      return await ctx.render('error', { 
        message: 'User not found',
        session: ctx.session
      });
    }
    
    const posts = await Post.findByUserId(user.id);
    const isOwner = ctx.session.user && ctx.session.user.id === user.id;
    
    await ctx.render('user', { 
      user, 
      posts, 
      isOwner,
      session: ctx.session
    });
  },

  createPost: async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.redirect('/');
      return;
    }
    
    const { content } = ctx.request.body;
    const userId = ctx.session.user.id;
    
    if (!content) {
      ctx.redirect(`/${ctx.session.user.username}`);
      return;
    }
    
    await Post.create({ userId, content });
    ctx.redirect(`/${ctx.session.user.username}`);
  }
};
