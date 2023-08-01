module.exports = {
    async up(db, client) {
      if (db.collection('users')) {
        console.log(db.collection('users'))
  
      }
    
     return db.collection('users').insertMany([
      {
        email: 'mohammed.abdelhady@pharaohsoft.com',
        password: '$2a$10$oW26wYZ9jbHLUlEfarUUJuBFjAoFXbvAh4q/yBBxCqiM2qCvQEc3S',
        phoneNumber: '+201000000',
        role: 'SUPER_ADMIN',
        profilePicture: 'https://cauris.s3.eu-west-3.amazonaws.com//assets/db72940c-0112-4776-9057-22cde7ea7c70.jpeg',
        emailVerified: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ]);
    },
  
    async down(db, client) {
      // TODO write the statements to rollback your migration (if possible)
      // Example:
      await db.collection('users').deleteOne({email: 'amiraatalla63@gmail.com'} );
    }
  };

  module.exports = {
    mongodb: {
      url: 'mongodb+srv://amira:amira@buyby.w4rzjcu.mongodb.net/?retryWrites=true&w=majority',
      databaseName: 'test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    migrationsDir: 'migrations',
    changelogCollectionName: 'changelog',
  };
  