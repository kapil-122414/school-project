function generateColor(name) {
  let hash = 0;
  const str = String(name || "Student");

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color =
    "#" + (hash & 0x00ffffff).toString(16).toUpperCase().padStart(6, "0");

  return color;
}

module.exports = generateColor;
