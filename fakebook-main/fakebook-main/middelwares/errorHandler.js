function handleErrors(error, req, res, next) {
    console.log(error);
    res.status(500).render('error/500');
  }
  
  module.exports = handleErrors;