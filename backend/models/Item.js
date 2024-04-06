var mongoose = require("mongoose"),
  uniqueValidator = require("mongoose-unique-validator"),
  slug = require("slug"),
  User = mongoose.model("User");
var { OpenAI } = require("openai");

const openai = new OpenAI();

var ItemSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: { type: String, required: [true, "can't be blank"] },
    description: { type: String, required: [true, "can't be blank"] },
    image: String,
    favoritesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tagList: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ItemSchema.plugin(uniqueValidator, { message: "is already taken" });

ItemSchema.pre("validate", function (next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ItemSchema.methods.slugify = function () {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

ItemSchema.pre("save", async function (next) {
  if (!this.image) {
    try {
      await this.imagify();
    } catch (error) {
      console.error(error);
    }
  }
  next();
});

// possibly utility functiuon
ItemSchema.methods.imagify = async function () {
  const response = await openai.images.generate({
    model: "dall-e-2",
    prompt: this.title + this.description,
    n: 1,
    size: "256x256",
  });
  console.log(`Resp: ${JSON.stringify(response)}`);
  this.image = response.data[0].url;
}

ItemSchema.methods.updateFavoriteCount = function () {
  var item = this;

  return User.count({ favorites: { $in: [item._id] } }).then(function (count) {
    item.favoritesCount = count;

    return item.save();
  });
};

ItemSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    image: this.image,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    seller: this.seller.toProfileJSONFor(user)
  };
};

mongoose.model("Item", ItemSchema);
