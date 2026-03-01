const jwt = require("jsonwebtoken")  ;

 function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ ok:  false, message: "está faltando o token" });
  }

  const  [type, token] = header.split(" ") ;

if (type !== "Bearer" || !token) {
     return res.status(401).json({ ok: false, message: "formato invalido de token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "token invalido" });
  }
}

module.exports =  { authMiddleware };