const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Conversation extends Model { }

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    conversation_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User', // or the name of your user table
        key: 'id',
      },
    },
    owner_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'conversation',
  }
);

module.exports = Conversation;