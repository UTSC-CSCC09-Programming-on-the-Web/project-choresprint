import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Import common validator middleware
import { validateRequest } from "./houseValidators";

// Validators for chore endpoints
export const createChoreValidator = [
  body("title")
    .notEmpty()
    .withMessage("Chore title is required")
    .isString()
    .withMessage("Chore title must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Chore title must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Chore description must be a string"),
  body("houseId")
    .notEmpty()
    .withMessage("House ID is required")
    .isInt()
    .withMessage("House ID must be an integer"),
  body("points")
    .optional()
    .isInt()
    .withMessage("Points must be between 1 and 100"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date in ISO 8601 format"),
  body("assignedToId")
    .optional()
    .isInt()
    .withMessage("Assigned user ID must be an integer"),
  validateRequest,
];

export const updateChoreValidator = [
  param("id").isInt().withMessage("Chore ID must be an integer"),
  body("title")
    .optional()
    .isString()
    .withMessage("Chore title must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Chore title must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Chore description must be a string"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date in ISO 8601 format"),
  body("isCompleted")
    .optional()
    .isBoolean()
    .withMessage("isCompleted must be a boolean"),
  body("assignedToId")
    .optional()
    .isInt()
    .withMessage("Assigned user ID must be an integer"),
  validateRequest,
];

export const getChoreValidator = [
  param("id").isInt().withMessage("Chore ID must be an integer"),
  validateRequest,
];

export const deleteChoreValidator = [
  param("id").isInt().withMessage("Chore ID must be an integer"),
  validateRequest,
];

// Validator for the file upload endpoint
export const uploadCompletionPhotoValidator = [
  param("id").isInt().withMessage("Chore ID must be an integer"),
  // File validation happens in multer middleware
  validateRequest,
];
