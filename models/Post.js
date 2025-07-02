const { db } = require('../db');

class Post {
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static create(post) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO posts (user_id, content) VALUES (?, ?)',
        [post.userId, post.content],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  }
}

module.exports = Post;
