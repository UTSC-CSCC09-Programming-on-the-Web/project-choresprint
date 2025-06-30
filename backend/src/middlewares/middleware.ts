import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";

// Export as RequestHandler type to satisfy Express typing
export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return; // Return void instead of the response
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token not provided" });
    return; // Return void instead of the response
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return; // Return void instead of the response
  }
}
