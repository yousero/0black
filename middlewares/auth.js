module.exports = function() {
  return async (ctx, next) => {
    const publicRoutes = ['/', '/login', '/register', '/logout'];
    const isApiRoute = ctx.path.startsWith('/api');

    if (publicRoutes.includes(ctx.path)) {
      await next();
      return;
    }

    if (!ctx.session || !ctx.session.user) {
      if (isApiRoute) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
      } else {
        ctx.redirect('/');
      }
      return;
    }
    
    await next();
  };
};
