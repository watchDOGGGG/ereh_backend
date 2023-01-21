import jwt from "jsonwebtoken";

// Accecc token has two functions Generate token and validate the token
export class AccessToken {
  constructor(Credentials) {
    this.Credentials = Credentials;
  }

  /**
   * Generate token receives the user credentials, stores in and return a signed token
   * @param {object} {
   *    userid: string,
   *    username: string,
   *    useremail: string
   * }
   * 
   */
  static GenerateToken(Credentials) {
    try {
      const payload = {
        user: Credentials,
      };
      return jwt.sign(payload, "key", { expiresIn: "1d" });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // validate token will check if the token is valid and return a boolean false if invalid else return the user details stored by jwt
  // The token can be access by the header key AccessToken 
  static ValidateToken(req, res, next) {
    try {
      const jwtToken = req.header("AccessToken");

      if (!jwtToken || jwtToken === 'false') {
        return res
          .status(401)
          .send({ message: "Not Authorize to perform this action" });
      }
      const payload = jwt.verify(jwtToken, "key");
      req.user = payload.user;
      next();
    } catch (error) {
      throw new Error("error on server")
    }
  }
}
