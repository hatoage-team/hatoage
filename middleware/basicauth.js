export default function basicAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Page"');
    return res.status(401).send("Authentication required");
  }

  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Page"');
  res.status(401).send("Invalid credentials");
}
