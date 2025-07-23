import { body, param, query } from "express-validator";
import { validateRequest } from "./houseValidators";

// Validators for user endpoints
export const createUserValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("name")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("avatarUrl").optional().isString(),
  validateRequest,
];

export const updateUserValidator = [
  param("id").isInt().withMessage("User ID must be an integer"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("name")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("avatarUrl").optional().isString(),
  validateRequest,
];

export const deleteUserValidator = [
  param("id").isInt().withMessage("User ID must be an integer"),
  validateRequest,
];

export const getUserValidator = [
  param("id").isInt().withMessage("User ID must be an integer"),
  validateRequest,
];

export const getUsersValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  validateRequest,
];

export const updateUserPreferencesValidator = [
  body("weeklyDigest")
    .isBoolean()
    .withMessage("weeklyDigest must be a boolean"),
  validateRequest,
];