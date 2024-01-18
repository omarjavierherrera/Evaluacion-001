const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check, validationResult } = require('express-validator');


router.post(
  '/register',
  [
    check('username', 'El nombre de usuario es obligatorio').notEmpty(),
    check('password', 'La contraseña es obligatoria').notEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  ],
  async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      const existingUser = await authController.getUserByUsername(username);

      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }

      // Crear el nuevo usuario
      const newUser = await authController.registerUser(username, password);


      const token = authController.generateAuthToken(newUser);

      res.json({ token, userId: newUser._id, username: newUser.username });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  }
);

router.post(
  '/login',
  [
    check('username', 'El nombre de usuario es obligatorio').notEmpty(),
    check('password', 'La contraseña es obligatoria').notEmpty(),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      // Verificar si el usuario existe
      const user = await authController.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
      }

      // Verificar la contraseña
      const passwordMatch = await authController.comparePassword(password, user.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
      }

      const token = authController.generateAuthToken(user);

      res.json({ token, userId: user._id, username: user.username });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
);

module.exports = router;
