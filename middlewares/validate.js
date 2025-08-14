module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Données invalides.',
        details: error.details.map((d) => d.message)
      });
    }

    next();
  };
};
