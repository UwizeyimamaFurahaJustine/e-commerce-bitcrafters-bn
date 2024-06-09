'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'orderNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })

    await queryInterface.addColumn('Orders', 'expectedDeliveryDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'orderNumber')
    await queryInterface.removeColumn('Orders', 'expectedDeliveryDate')
  },
}
