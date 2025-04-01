const db = require('../data/database');
const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');

class User {
  constructor(userData) {
    this.email = userData.email;
    this.password = userData.password;
    this.firstname = userData.firstname;
    this.lastname = userData.lastname;
    this.username = userData.username;
    this.country = userData.country;
    this.city = userData.city;
    this.image = userData.image;
    this.updateImageData(); // Ensure imagePath and imageUrl are set correctly
    if (userData._id) {
      this.id = userData._id.toString();
    }
  }

  // Update imagePath and imageUrl whenever the image changes
  updateImageData() {
    if (this.image) {
      this.imagePath = `/users_img/${this.image}`;
      this.imageUrl = `/users/img/${this.image}`;
    } else {
      this.imagePath = null;
      this.imageUrl = null;
    }
  }

  async save() {
    try {
      // Hash the password if it is provided
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
      }

      if (this.id) {
        // Update existing user
        const userId = new mongodb.ObjectId(this.id);
        const result = await db.getDb().collection('users').updateOne(
          { _id: userId },
          {
            $set: {
              email: this.email,
              password: this.password,
              firstname: this.firstname,
              lastname: this.lastname,
              username: this.username,
              country: this.country,
              city: this.city,
              image: this.image,
              imagePath: this.imagePath,
              imageUrl: this.imageUrl
            }
          }
        );

        if (!result.modifiedCount) {
          throw new Error('Failed to update user.');
        }
        return result;
      } else {
        // Insert new user
        const result = await db.getDb().collection('users').insertOne({
          email: this.email,
          password: this.password,
          firstname: this.firstname,
          lastname: this.lastname,
          username: this.username,
          country: this.country,
          city: this.city,
          image: this.image,
          imagePath: this.imagePath,
          imageUrl: this.imageUrl
        });

        if (!result.insertedId) {
          throw new Error('Failed to create user.');
        }

        this.id = result.insertedId.toString();
        return result;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUserWithSameEmail() {
    return db.getDb().collection('users').findOne({ email: this.email });
  }

  static async findById(userId) {
    try {
      const uid = new mongodb.ObjectId(userId);
      const userData = await db.getDb().collection('users').findOne({ _id: uid });

      if (!userData) {
        return null;
      }

      return new User(userData);
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async hasMatchingPassword(hashedPassword) {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(this.password, hashedPassword);
  }

  async update(updatedData) {
    const userId = new mongodb.ObjectId(this.id);
    const userData = {};

    // Only include fields that are explicitly provided in updatedData
    if (updatedData.email !== undefined) userData.email = updatedData.email;
    if (updatedData.firstname !== undefined) userData.firstname = updatedData.firstname;
    if (updatedData.lastname !== undefined) userData.lastname = updatedData.lastname;
    if (updatedData.username !== undefined) userData.username = updatedData.username;
    if (updatedData.country !== undefined) userData.country = updatedData.country;
    if (updatedData.city !== undefined) userData.city = updatedData.city;
    if (updatedData.image !== undefined) {
      this.image = updatedData.image;
      this.updateImageData(); // Update imagePath and imageUrl
      userData.image = this.image;
      userData.imagePath = this.imagePath;
      userData.imageUrl = this.imageUrl;
    }

    // Hash the password if it is provided
    if (updatedData.password) {
      userData.password = await bcrypt.hash(updatedData.password, 12);
    }

    // Update the user in the database
    const result = await db.getDb().collection('users').updateOne(
      { _id: userId },
      { $set: userData }
    );

    if (!result.modifiedCount) {
      throw new Error('Failed to update user.');
    }

    return result;
  }
}

module.exports = User;