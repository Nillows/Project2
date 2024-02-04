const { Model, DataTypes, DECIMAL } = require('sequelize');
const sequelize = require('../config/connection');

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nice_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'conversation',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'message',
  }
);

module.exports = Message;
