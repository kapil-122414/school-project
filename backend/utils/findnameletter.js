function findname(name) {
  if (!name || typeof name !== "string") {
    return "ST";
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "ST";
  }
  return parts
    .slice(0, 2)
    .map((item) => item[0].toUpperCase())
    .join("");
}

module.exports = findname;
