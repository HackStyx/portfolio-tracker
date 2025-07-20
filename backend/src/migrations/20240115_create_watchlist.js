// This migration file is for Sequelize and is not used with Supabase
// For Supabase, tables are created through the Supabase dashboard or SQL migrations
// See supabase-schema.sql for the actual table creation

/*
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('watchlists', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ticker: {
        type: DataTypes.STRING,
        allowNull: false
      },
      target_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      current_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('watchlists');
  }
};
*/

// Supabase migration placeholder
module.exports = {
  up: async () => {
    console.log('Migration not needed for Supabase - tables are managed separately');
  },
  down: async () => {
    console.log('Migration not needed for Supabase - tables are managed separately');
  }
}; 