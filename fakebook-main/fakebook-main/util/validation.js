function validateUserSignup(userData) {
  const errors = [];
  
  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Please enter a valid email.');
  }
  
  if (!userData.password || userData.password.trim().length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }
  
  if (!userData.username || userData.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long.');
  }
  
  if (!userData.firstname || !userData.secondname) {
    errors.push('Please provide your first and last name.');
  }
  
  if (!userData.city || !userData.country) {
    errors.push('Please provide your city and country.');
  }
  
  return errors;
}

module.exports = {
  validateUserSignup: validateUserSignup
};