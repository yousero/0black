const Router = require('koa-router');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const settingsController = require('./controllers/settingsController');
const authenticate = require('./middlewares/auth');

const router = new Router();

router.get('/', authController.showHome);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/settings', authenticate(), settingsController.showSettings);
router.post('/settings', authenticate(), settingsController.updateSettings);
router.post('/post', authenticate(), userController.createPost);

router.get('/:username', userController.profile);

module.exports = router;
