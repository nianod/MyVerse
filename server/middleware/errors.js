export function notFound(_req, res) {
  res.status(404).json({ error: "Resource not found." });
}
export function errors(err, _req, res, _next) {
  if (err?.name === "ZodError")
    return res
      .status(400)
      .json({ error: err.issues[0]?.message || "Invalid request." });
  if (err?.code === 11000)
    return res
      .status(409)
      .json({ error: "An account with that email already exists." });
  console.error("Request failed", { name: err?.name });
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
