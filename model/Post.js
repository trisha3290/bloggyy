const mongoose = require('mongoose');
const Schema = mongoose.Schema;

PostSchema = new Schema( {
	
  title: String,
  content: String,
  author: String,
  like: Number,
  createdAt: {
		type: Date,
		default: Date.now
	}
}),
Post = mongoose.model('Post', PostSchema);

module.exports = Post;