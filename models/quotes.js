'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class quotes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  quotes.init({
    quote: DataTypes.STRING,
    date: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'quotes',
  });
  return quotes;
};