const getInitials = require("../utils/findnameletter");
const generateColor = require("../utils/random.color");
const createSvg = require("../utils/avatarsvg");

async function createAvatar(name, userId) {
  const initials = getInitials(name);
  const color = generateColor(name);
  const svg = createSvg(initials, color);
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return {
    url: dataUri,
    public_id: `avatar_${userId || Date.now()}`,
  };
}

module.exports = createAvatar;
