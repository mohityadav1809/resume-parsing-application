// Import Sequelize
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite' // File path to SQLite database
});

// Define a model representing a 'User' table
const User = sequelize.define('User', {
  // Define model attributes
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
});

// Define an async function to test the database operations
async function testDatabase() {
  // Synchronize the model with the database (create the table if it doesn't exist)
  await User.sync();

  // Create a new user
  const newUser = await User.create({
    firstName: 'John',
    lastName: 'Doe'
  });
  console.log('New user created:', typeof(newUser));

  console.log('New user created2 :', newUser.toJSON());


  // Find all users
  const allUsers = await User.findAll();
  console.log('All users:', allUsers.map(user => user.toJSON()));

  // Update a user
  await User.update({ lastName: 'Smith' }, {
    where: { firstName: 'John' }
  });
  console.log('User updated');

  // Find a specific user
  const foundUser = await User.findOne({ where: { firstName: 'John' } });
  console.log('Found user:', foundUser.toJSON());

  // Delete a user
  await User.destroy({ where: { firstName: 'John' } });
  console.log('User deleted');

  // Find all users again to verify deletion
  const remainingUsers = await User.findAll();
  console.log('Remaining users:', remainingUsers.map(user => user.toJSON()));
}

// Call the function to test the database operations
testDatabase().catch(console.error);
