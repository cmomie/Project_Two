'use strict';
const {
  Model
} = require('sequelize');
const quotes = require('./quotes');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.comment.belongsTo(models.user)
      models.comment.belongsTo(models.quotes)
    }
  }
  comment.init({
    content: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    quotesId:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};