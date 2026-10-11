import jwt from "jsonwebtoken";
export const tokenFor = (user) =>
  jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
export function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies.myverse_session ||
      req.header("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error();
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: "Authentication required." });
  }
}
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};
