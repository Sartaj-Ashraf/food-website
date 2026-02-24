
import { UnAuthenticatedErr, UnauthorizedErr } from "../errors/customErors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new UnAuthenticatedErr(
      "Authentication invalid - Please sign in"
    );
  }

  try {
    const { userId, role, email, fullName, phoneNumber } = verifyJWT(token);
    req.user = { userId, role, email, fullName, phoneNumber };
    next();
  } catch (error) {
    throw new UnAuthenticatedErr(
      "Authentication invalid - Please sign in"
    );
  }
};
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token || token === 'logout') {
    req.user = null;
    return next();
  }
  
  try {
    const { userId, role, email, fullName, phoneNumber } = verifyJWT(token);
    req.user = {
      userId,
      role,
      email,
      fullName,
      phoneNumber
    };
    next();
  } catch (error) {
    console.log('Invalid token in optionalAuth:', error.message);
    req.user = null;
    next();
  }
};


export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedErr("Unauthorized to access this route");
    }
    next();
  };
};