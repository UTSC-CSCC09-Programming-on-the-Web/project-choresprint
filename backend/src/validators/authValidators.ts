import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Import common validator middleware
import { validateRequest } from "./houseValidators";

// Auth validators
export const loginValidator = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateRequest,
];

export const signupValidator = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  validateRequest,
];

export const refreshTokenValidator = [
  body("refreshToken")
    .optional()
    .isString()
    .withMessage("Refresh token must be a string"),
  validateRequest,
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  validateRequest,
];

export const newPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  validateRequest,
];
