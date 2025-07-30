import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware to check validation results
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Validators for house endpoints
export const createHouseValidator = [
  body("name")
    .notEmpty()
    .withMessage("House name is required")
    .isString()
    .withMessage("House name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("House name must be between 2 and 100 characters"),
  validateRequest,
];

export const updateHouseValidator = [
  param("id").isInt().withMessage("House ID must be an integer"),
  body("name")
    .notEmpty()
    .withMessage("House name is required")
    .isString()
    .withMessage("House name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("House name must be between 2 and 100 characters"),
  validateRequest,
];

export const deleteHouseValidator = [
  param("id").isInt().withMessage("House ID must be an integer"),
  validateRequest,
];

export const getHouseValidator = [
  param("id").isInt().withMessage("House ID must be an integer"),
  validateRequest,
];

export const getHousesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  validateRequest,
];

export const getHouseChoresValidator = [
  param("id").isInt().withMessage("House ID must be an integer"),
  query("cursor").optional().isInt().withMessage("Cursor must be an integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "dueDate", "title"])
    .withMessage("Sort by must be one of: createdAt, dueDate, title"),
  query("sortDir")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort direction must be either asc or desc"),
  query("assignedTo")
    .optional()
    .isInt()
    .withMessage("AssignedTo must be an integer"),
  validateRequest,
];
